<script lang="ts">
    import AmazonItem from "$lib/components/AmazonItem.svelte";
    import QueueMember from "$lib/components/QueueMember.svelte";
    import type {
        ApiResponse,
        DBAmazonProduct,
        DBGameQueue,
        DBQueueMember,
    } from "$lib/types";
    import { Column, Heading, HorizontalRule, Text } from "duckylib";
    import { onMount } from "svelte";

    async function fetchQueue(): Promise<DBGameQueue | null> {
        const res: ApiResponse<DBGameQueue> = await (
            await fetch(`/api/gamequeue`)
        ).json();
        return res.data?.id ? res.data : null;
    }

    onMount(async () => {
        queue = await fetchQueue();
        queueMembers = queue?.members || [];
        setInterval(async () => {
            queue = await fetchQueue();
            queueMembers = queue?.members || [];
        }, 1e3);
    });

    let queue: DBGameQueue | null = $state(null);
    let queueMembers: DBQueueMember[] = $state([]);
</script>

<Column justifyContent="flex-start" textWrap>
    <Text maxLines={1}>Game Queue{queue?.game ? ` - ${queue.game}` : ""}</Text>
    {#if !queue}
        <Heading size={3} weight="bold">No Active Queue</Heading>
    {:else}
        <Column heightPx="fit" widthPx="fit" textWrap>
            <Text maxLines={1} weight="bold"
                >Players Per-Round: {queue.membersPerRound.toLocaleString()}</Text
            >
            <Text maxLines={1} weight="bold"
                >Max Queue Size: {queue.maximumRosterSize.toLocaleString()}</Text
            >
        </Column>
        {#if queueMembers.length <= 0}
            <Heading size={3} weight="bold">No Players in Queue</Heading>
        {:else}
            <Heading size={3} weight="bold"
                >Player Queue ({queueMembers.length}/{queue.maximumRosterSize} Player{queueMembers.length ===
                1
                    ? ""
                    : "s"})</Heading
            >
            <Column justifyContent="flex-start" textWrap>
                <Text maxLines={1} weight="bold">Next Players...</Text>
                {#each queueMembers as member, i}
                    <QueueMember {member} />
                    {#if i + 1 === queue.membersPerRound && queueMembers.length > i + 1}
                        <HorizontalRule widthPercent={70} />
                        <Text classList={["italic"]}>Overflow List</Text>
                    {/if}
                {/each}
            </Column>
        {/if}
    {/if}
</Column>
