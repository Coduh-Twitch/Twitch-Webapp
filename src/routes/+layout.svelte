<script lang="ts">
	import "duckylib/styles/globals.css";
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
    import { Website, Header, setUserData, getTheme } from 'duckylib';
    import { onMount } from 'svelte';
    import { page } from "$app/state";
    import { PUBLIC_TWITCH_CLIENT_ID, PUBLIC_TWITCH_OAUTH_BASE_URL, PUBLIC_TWITCH_OAUTH_REDIRECT_URI } from "$env/static/public";
    import type { ApiResponse } from "$lib/types";

	let { children } = $props();

	async function fetchScopes(): Promise<string[]> {
		let res: ApiResponse<string[]> = await (await fetch(`/api/scopes`)).json();
		return res.data || [];
	}

	onMount(async () => {
		scopes = await fetchScopes();
	})

	let scopes: string[] = $state([]);

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if page.url.pathname as string === "/overlay"}
{@render children()}
{:else}
<Website options={{ theme: "dark" }}>
	
	<Header
			emoji="🤖"
			label="ShortBotduh"
			defaultNav={true}
			nav={[
				{
					label: "Commands",
					pathname: "/commands",
					symbol: "code_xml"
				},
				{
					label: "Documentation", 
					symbol: "book", 
					pathname: "https://docs.ducky.wiki/coduh/twitch_guide"
				},

			]}
			authFeatures={true}
			onlogin={async () => {
				let redirectUrl = new URL(`${PUBLIC_TWITCH_OAUTH_BASE_URL}/authorize`);
				redirectUrl.searchParams.append("response_type", "code")
				redirectUrl.searchParams.append("client_id", PUBLIC_TWITCH_CLIENT_ID)
				redirectUrl.searchParams.append("redirect_uri", PUBLIC_TWITCH_OAUTH_REDIRECT_URI)
				redirectUrl.searchParams.append("scope", scopes.join(" "));
				redirectUrl.searchParams.append("state", page.url.pathname);
   				redirectUrl.searchParams.append("force_verify", "true")

				if(browser) window.location.replace(redirectUrl);
			}}
			onlogout={async () => {
				if(browser) window.location.replace(`/auth/logout`)
			}}
		/>

{@render children()}
<!-- <div></div> -->
</Website>
{/if}

<style>
	div {
		height: 100%;
	}

	:global(::-webkit-scrollbar) {
    display: none !important;
    width: 0px !important;
    height: 0px !important;
    background: transparent !important;
}

:global(html, body, .chat) {
    scrollbar-width: none !important; /* Firefox fallback */
    -ms-overflow-style: none !important; /* Edge fallback */
}
</style>

