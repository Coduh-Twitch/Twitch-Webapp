<script lang="ts">
    import AmazonItem from "$lib/components/AmazonItem.svelte";
    import type { ApiResponse, DBAmazonProduct } from "$lib/types";
    import { Column, Heading, Text } from "duckylib";
    import { onMount } from "svelte";

    async function fetchQueue(): Promise<DBAmazonProduct[]> {
        const res: ApiResponse<DBAmazonProduct[]> = await (
            await fetch(`/api/amazon/queue`)
        ).json();
        let total = 0;
        for (const item of res.data || []) {
            total += item.price;
        }
        queueTotal = total;
        return res.data || [];
    }

    onMount(async () => {
        queue = await fetchQueue();
        setInterval(async () => {
            queue = await fetchQueue();
        }, 1e3);
    });

    let queue: DBAmazonProduct[] = $state([]);
    let queueTotal: number = $state(0);
</script>

<Column justifyContent="flex-start" textWrap>
    <Text maxLines={1}>Coduh Amazon Stream Queue</Text>
    {#if queue.length <= 0}
        <Heading size={3} weight="bold">No Items in Queue</Heading>
    {:else}
        <Heading size={3} weight="bold"
            >Product Queue ({queue.length} Item{queue.length === 1 ? "" : "s"} - ${queueTotal}
            total)</Heading
        >
        <Column justifyContent="flex-start" textWrap>
            {#each queue as item}
                <AmazonItem {item} />
            {/each}
        </Column>
    {/if}
</Column>
