<script lang="ts">
    import { browser } from "$app/environment";
    import type { DBAmazonProduct, DBCounter } from "$lib/types";
    import { Text, Row, Button, Column } from "duckylib";

    interface CounterItemProps {
        counter: DBCounter;
        withRename?: boolean;
    }

    const { counter, withRename = false }: CounterItemProps = $props();

    async function incrementCounter(): Promise<void> {
      await fetch(`/api/counters/${counter.id}/increment`, {method: "POST"});
    }

    async function decrementCounter(): Promise<void> {
      await fetch(`/api/counters/${counter.id}/decrement`, {method: "POST"});
    }

    async function resetCounter(): Promise<void> {
      await fetch(`/api/counters/${counter.id}/reset`, {method: "POST"});
    }

    async function renameCounter(name: string): Promise<void> {
      await fetch(`/api/counters/${counter.id}/rename/${encodeURIComponent(name)}`, {method: "POST"});
    }

    async function deleteCounter(): Promise<void> {
      await fetch(`/api/counters/${counter.id}/delete`, {method: "POST"});
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div>
        <Row
            widthPx="fit"
            heightPx="fit"
            gapEm={0.66}
            justifyContent="flex-start"
            textWrap
        >

            <Button
                label="RESET TO 0"
                type="danger"
                onclick={async () => {
                  await resetCounter();
                }}
            />
            <Button
                label="DELETE"
                type="danger"
                onclick={async () => {
                    await deleteCounter()
                }}
            />
            {#if withRename}
                <Button
                    label="Re-Label"
                    type="primary"
                    onclick={async () => {
                        const name = prompt(`Enter the new name for the "${counter.id}" counter`, "Counter");

                        if(name) await renameCounter(name);
                    }}
                />
            {/if}
            <Column gapEm={0.1} alignItems="flex-start" widthPx="fit">
                <Row>
                    <Text maxLines={1} weight="bold"
                        >{counter.label.split(" ").slice(0, 15).join(" ")}</Text
                    >
                </Row>
            </Column>
        </Row>
    <Row widthPx="fit" heightPx="fit" gapEm={0.66} textWrap>

        <Button
            label="-1"
            type="danger"
            onclick={async () => {
              await decrementCounter()
            }}
        />
        <Text maxLines={1} weight="bold" sizeEm={1.33}
            >{counter.count.toLocaleString()}</Text
        >
        <Button
            label="+1"
            type="success"
            onclick={async () => {
                await incrementCounter()
            }}
        />
    </Row>
</div>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--mantle);
        border: 2px solid var(--crust);
        border-radius: var(--border-md);
        width: 80%;
        /* min-height: 30px; */
        height: auto;
        padding: 0.66em 1em;
        gap: 0.66em;
        text-wrap: wrap;
    }

    div:not(:hover) {
        transform: 0.2s all;
        scale: 1;
    }

    div:hover {
        transform: 0.2s all;
        border: 2px solid var(--overlay-0);
        cursor: pointer;
    }

    img {
        height: 3em;
        aspect-ratio: 1/1;
        border-radius: var(--border-md);
        border: 2px solid var(--surface-1);
    }

    category {
        background-color: var(--blue);
        color: var(--mantle) !important;
        padding: 0.2em 0.66em;
        border-radius: var(--border-sm);
    }
</style>
