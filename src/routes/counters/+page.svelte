<script lang="ts">
    import AmazonItem from "$lib/components/AmazonItem.svelte";
    import CounterItem from "$lib/components/CounterItem.svelte";
    import type { ApiResponse, DBCounter } from "$lib/types";
    import { Column, Heading, Text } from "duckylib";
    import { onMount } from "svelte";

    async function fetchCounters(): Promise<DBCounter[]> {
        const res: ApiResponse<DBCounter[]> = await (
            await fetch(`/api/counters`)
        ).json();
        return res.data || [];
    }

    onMount(async () => {
        counters = await fetchCounters();
        setInterval(async () => {
            counters = await fetchCounters();
        }, 5e2);
    });

    let counters: DBCounter[] = $state([]);
</script>

<Column justifyContent="flex-start" textWrap>
    <Text maxLines={1}>Counters</Text>
    {#if counters.length <= 0}
        <Heading size={3} weight="bold">No Counters Created</Heading>
    {:else}
        <Heading size={3} weight="bold"
            >{counters.length} Counter{counters.length === 1 ? "" : "s"}</Heading
        >
        <Column justifyContent="flex-start" textWrap>
            {#each counters as counter}
                <CounterItem {counter} />
            {/each}
        </Column>
    {/if}
</Column>
