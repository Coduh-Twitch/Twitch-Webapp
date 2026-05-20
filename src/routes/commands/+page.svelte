<script lang="ts">
    import { PUBLIC_MOBILE_SIZE_PX } from "$env/static/public";
    import CommandCard from "$lib/components/CommandCard.svelte";
    import type { ApiResponse, ChatCommand, CustomCommand } from "$lib/types";
    import {
        Column,
        getUserData,
        Heading,
        HorizontalRule,
        Text,
    } from "duckylib";
    import { onMount } from "svelte";
    import { MediaQuery } from "svelte/reactivity";

    async function fetchCommands(): Promise<ChatCommand[]> {
        let res: ApiResponse<ChatCommand[]> = await (
            await fetch(`/api/chatbot/commands`)
        ).json();
        if (!res || !res.data) return [];
        return res.data.sort((a, b) => b.userLevel.localeCompare(a.userLevel));
    }

    async function fetchCustomCommands(): Promise<CustomCommand[]> {
        let res: ApiResponse<CustomCommand[]> = await (
            await fetch(`/api/chatbot/commands/custom`)
        ).json();
        if (!res || !res.data) return [];
        return res.data;
    }

    let loading = $state(true);
    let commands: ChatCommand[] = $state([]);
    let customCommands: CustomCommand[] = $state([]);

    onMount(async () => {
        commands = await fetchCommands();
        customCommands = await fetchCustomCommands();

        setTimeout(() => {
            loading = false;
        }, 5e2);

        setInterval(async () => {
            commands = await fetchCommands();
            customCommands = await fetchCustomCommands();
            loading = false;
        }, 5e3);
    });

    let mobileQuery = new MediaQuery(`max-width: ${PUBLIC_MOBILE_SIZE_PX}px`);
</script>

<Column
    widthPx="fit"
    heightPx="fit"
    justifyContent="flex-start"
    alignItems="center"
    flexWrap={true}
>
    <Heading size={2} weight="bold">Chat Commands</Heading>
    {#if getUserData() !== null}
        <Text classList={["italic"]}
            >Welcome back, {getUserData()?.username}!</Text
        >
    {/if}
    <HorizontalRule widthPercent={80} />
    <Column
        widthPx="fill"
        heightPx="fill"
        justifyContent="flex-start"
        alignItems="center"
        gapEm={0.33}
    >
        {#if !loading && commands.length > 0}
            {#each commands as command}
                <CommandCard {command} />
                {#if (command.subCommands || []).length > 0}
                    {#each command.subCommands as subcommand}
                        <CommandCard {command} {subcommand} />
                    {/each}
                {/if}
            {/each}
        {:else if !loading}
            <Heading classList={["red"]} weight="bold" size={5}
                >No Commands :(</Heading
            >
        {:else}
            <Heading classList={["yellow"]} weight="bold" size={5}
                >Loading Command List...</Heading
            >
        {/if}
    </Column>

    <!-- {#if !mobileQuery.current} -->
        <Heading size={2} weight="bold">Custom Commands</Heading>
        <HorizontalRule widthPercent={80} />
        <Column
            widthPx="fill"
            heightPx="fill"
            justifyContent="flex-start"
            alignItems="center"
            gapEm={0.33}
        >
            {#if !loading && customCommands.length > 0}
                {#each customCommands as command}
                    <CommandCard customCommand={command} />
                {/each}
            {:else if !loading}
                <Heading classList={["red"]} weight="bold" size={5}
                    >No Custom Commands :(</Heading
                >
            {:else}
                <Heading classList={["yellow"]} weight="bold" size={5}
                    >Loading Custom Command List...</Heading
                >
            {/if}
        </Column>
    <!-- {/if} -->
</Column>

<style>
</style>
