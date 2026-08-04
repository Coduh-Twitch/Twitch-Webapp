<script lang="ts">
    import { browser } from "$app/environment";
    import { AppConfig } from "$lib/config";
    import { Column, getUserData, Heading, Text, UserRoles } from "duckylib";
    import { onMount } from "svelte";

    async function fetchCurrentUser() {
        let res = await (await fetch(`/api/users/@me`)).json();
        return res;
    }

    onMount(async () => {
        let u = await fetchCurrentUser();
        if (!u || !getUserData()) {
            if (browser) window.location.replace("/commands");
        }
    });
</script>

<Column
    heightPercent={90}
    justifyContent="center"
    alignItems="center"
    textAlign="center"
>
    {#if !getUserData()}
        <Heading size={4} weight="bold">Please Log In</Heading>
    {:else}
        <Heading size={3} weight="bold"
            >Hello, {getUserData()?.username}!</Heading
        >
        <Text>You got it from here!</Text>
        <a href="/commands"
            ><Heading size={4} inheritColor={true}><u>View Commands</u></Heading
            ></a
        >
        <a href="/deathcounter"
            ><Heading size={4} inheritColor={true}
                ><u>Manage Death Counter</u></Heading
            ></a
        >
        <a href="/amazon"
            ><Heading size={4} inheritColor={true}><u>Amazon Queue</u></Heading
            ></a
        >
        <a href="/gamequeue"
            ><Heading size={4} inheritColor={true}><u>Game Queue</u></Heading
            ></a
        >
        {#if getUserData()?.role === UserRoles.ADMIN}
            <a href="/soundalerts"
                ><Heading size={4} inheritColor={true}
                    ><u>Manage Sound Alerts</u></Heading
                ></a
            >
        {/if}
    {/if}
</Column>
