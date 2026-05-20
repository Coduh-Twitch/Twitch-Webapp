<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import type { TwitchUser } from "$lib/types";
    import { getUserData, setUserData, UserRoles, type Auth } from "duckylib";
    import { onMount } from "svelte";

    let user: TwitchUser | null = $state(null);


    onMount(async () => {
        user = (await (await fetch(`/api/users/@me`)).json()).data || null;

        setInterval(async () => {
        if(user !== null && getUserData() === null) {
            setUserData({id: user.id, avatarUrl: user.profile_image_url, role: UserRoles.DEFAULT, username: user.login})
        }else if (getUserData() !== null) {
            if(browser) window.location.replace(page.url.searchParams.get("from") || "/")
        } else if(user === null) {
            user = (await (await fetch(`${page.url.protocol}//${page.url.hostname}${page.url.protocol.includes("https") ? "" : `:${page.url.port}`}/api/users/@me`)).json()).data || null;
        }
    },5e2)
    })

    
</script>

👍 yuo have did it