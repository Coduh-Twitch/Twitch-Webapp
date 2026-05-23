<script lang="ts">
    import { AppConfig } from "$lib/config";
    import { Column, getUserData, Heading, Text } from "duckylib";
    import { onMount } from "svelte";

    async function fetchCurrentUser() {
        let res = await (await fetch(`/api/users/@me`)).json();
        return res;
    } 

    onMount(async () => {
        await fetchCurrentUser();
    })
</script>

<Column
    heightPercent={90}
    justifyContent="center"
    alignItems="center"
    textAlign="center"
>
    {#if !getUserData()}
        <Heading size={4} weight="bold"
            >This app has Twitch authorization</Heading
        >
        <ul>
            {#each AppConfig.scopes as scope}
                <li>{scope}</li>    
            {/each}
        </ul>
    {:else}
        <Heading size={3} weight="bold">Hello, {getUserData()?.username}!</Heading>
        <Text>You got it from here!</Text>
        <a href="/commands"><Heading size={4} inheritColor={true}><u>View Commands</u></Heading></a>
    {/if}
</Column>
