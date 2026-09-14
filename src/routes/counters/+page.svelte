<script lang="ts">
    import AmazonItem from "$lib/components/AmazonItem.svelte";
    import CounterItem from "$lib/components/CounterItem.svelte";
    import type { ApiResponse, DBCounter } from "$lib/types";
    import { Button, Column, Heading, Row, Text } from "duckylib";
    import { onMount } from "svelte";

    async function fetchCounters(): Promise<DBCounter[]> {
        const res: ApiResponse<DBCounter[]> = await (
            await fetch(`/api/counters`)
        ).json();
        return res.data || [];
    }

    async function ensureCounter(id: string): Promise<void> {
      await fetch(`/api/counters/${id.replace(" ", "-").replace("_", "-")}`)
      newCounterId = "";
    }

    onMount(async () => {
        counters = await fetchCounters();
        setInterval(async () => {
            counters = await fetchCounters();
        }, 5e2);
    });

    let counters: DBCounter[] = $state([]);
    let newCounterId: string = $state("");
</script>

<Column justifyContent="flex-start" textWrap>
    <Text maxLines={1}>Counters</Text>
    <Row heightPx="fit">
        <input type="text" name="id" id="id" bind:value={newCounterId}>
        <Button label="Create Counter" type={newCounterId.trim() !== "" ? "success" : "danger"} onclick={async () => {
          if(!counters.some(c => c.id === newCounterId) && newCounterId.trim() !== "") await ensureCounter(newCounterId);
        }} />
    </Row>
    {#if counters.length <= 0}
        <Heading size={3} weight="bold">No Counters Created</Heading>
    {:else}
        <Heading size={3} weight="bold"
            >{counters.length} Counter{counters.length === 1 ? "" : "s"}</Heading
        >
        <Column justifyContent="flex-start" textWrap>
            {#each counters as counter}
                <CounterItem {counter} withRename />
            {/each}
        </Column>
    {/if}
</Column>
