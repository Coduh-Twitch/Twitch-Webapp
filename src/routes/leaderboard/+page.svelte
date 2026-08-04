<script lang="ts">
    import AmazonItem from "$lib/components/AmazonItem.svelte";
    import LeaderboardMember from "$lib/components/LeaderboardMember.svelte";
    import QueueMember from "$lib/components/QueueMember.svelte";
    import type {
        ApiResponse,
        DBAmazonProduct,
        DBGameQueue,
        DBLeaderboardMember,
        DBQueueMember,
    } from "$lib/types";
    import {
        Column,
        getUserData,
        Heading,
        HorizontalRule,
        Row,
        Text,
    } from "duckylib";
    import { onMount } from "svelte";

    async function fetchleaderboard(): Promise<DBLeaderboardMember[]> {
        const res: ApiResponse<DBLeaderboardMember[]> = await (
            await fetch(`/api/leaderboard`)
        ).json();
        return res.data || [];
    }

    function ordinalSuffix(i: number): string {
        let j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) {
            return i.toLocaleString() + "st";
        }
        if (j === 2 && k !== 12) {
            return i.toLocaleString() + "nd";
        }
        if (j === 3 && k !== 13) {
            return i.toLocaleString() + "rd";
        }
        return i.toLocaleString() + "th";
    }

    let loading = $state(true);

    onMount(async () => {
        leaderboard = await fetchleaderboard();
        fullLeaderboard = await fetchleaderboard();
        if (leaderboard) loading = false;
        setInterval(async () => {
            let fetched = await fetchleaderboard();
            leaderboard =
                query === ""
                    ? fetched
                    : fetched.filter((m) =>
                          m.username
                              .toLowerCase()
                              .includes(query.toLowerCase()),
                      );
            fullLeaderboard = await fetchleaderboard();
            if (leaderboard && loading) loading = false;
            if (loading && !leaderboard) loading = true;
        }, 1e3);
    });

    let query = $state("");

    let leaderboard: DBLeaderboardMember[] = $state([]);
    let fullLeaderboard: DBLeaderboardMember[] = $state([]);
</script>

<Column justifyContent="flex-start" heightPx="fit" textWrap>
    <Text maxLines={1}>Coduh Points Leaderboard</Text>
    {#if loading}
        <Heading size={3} weight="bold">Loading Leaderboard...</Heading>
    {:else}
        {#if fullLeaderboard.length <= 0}
            <Heading size={3} weight="bold">Loading Rankings...</Heading>
        {:else}
            <!-- <Heading size={3} weight="bold"
                >Player Queue ({queueMembers.length}/{leaderboard.maximumRosterSize} Player{queueMembers.length ===
                1
                    ? ""
                    : "s"})</Heading
            > -->
            <Heading size={3} weight="bold">Points Leaderboard</Heading>
            <Text
                >{fullLeaderboard.length.toLocaleString()} Member{fullLeaderboard.length ===
                1
                    ? ""
                    : "s"}{getUserData()
                    ? ` • Your Position: ${ordinalSuffix(fullLeaderboard.indexOf(fullLeaderboard.find((u) => u.twitchId === (getUserData()?.id || "")) as any) + 1)}`
                    : ""}</Text
            >
            <Row flexWrap>
                <Text weight="bolder" sizeEm={1.1}>Search Leaderboard</Text>
                <input
                    type="text"
                    name="search"
                    id="search"
                    autocomplete="off"
                    bind:value={
                        () => query,
                        (v) => {
                            query = v.toLowerCase();
                            leaderboard = fullLeaderboard.filter((m) =>
                                m.username
                                    .toLowerCase()
                                    .includes(query.toLowerCase()),
                            );
                        }
                    }
                />
            </Row>

            <Column
                heightPx="fit"
                justifyContent="flex-start"
                alignItems="center"
                textWrap
            >
                {#if leaderboard.length === 0}
                    <Row widthPx="fit" heightPx="fit" gapEm={0.2}>
                        <Text maxLines={1}>No Results for "{query}"</Text>
                        <Text maxLines={1}>&bullet;</Text>
                        <Text maxLines={1}
                            ><a
                                style:cursor="pointer"
                                onclick={() => {
                                    leaderboard = fullLeaderboard;
                                    query = "";
                                }}>Clear Search</a
                            ></Text
                        >
                    </Row>
                {:else}
                    {#each leaderboard as member}
                        <LeaderboardMember
                            {member}
                            position={fullLeaderboard.indexOf(
                                fullLeaderboard.find(
                                    (m) => m.twitchId === member.twitchId,
                                ) as DBLeaderboardMember,
                            ) + 1}
                        />
                    {/each}
                {/if}
            </Column>
        {/if}
    {/if}
</Column>

<style>
    input[type="text"] {
        -webkit-appearance: textfield;
        -moz-appearance: textfield;
        appearance: textfield;
        border: 3px solid var(--surface-0);
        background-color: var(--crust);
        color: var(--text);
        padding: 0.33em 0.66em;
        font-size: 1em;
        outline: none;
        border-radius: var(--border-md);
        min-width: 300px;
    }
</style>
