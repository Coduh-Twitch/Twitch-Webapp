<script lang="ts">
    import { browser } from "$app/environment";
    import type { DBAmazonProduct } from "$lib/types";
    import { Text, Row, Button, Column } from "duckylib";

    interface AmazonItemProps {
        item: DBAmazonProduct;
    }

    const { item }: AmazonItemProps = $props();

    async function removeItem(asin: string): Promise<void> {
        (await (
            await fetch(`/api/amazon/queue/remove/${asin}`, { method: "POST" })
        ).json())
            ? alert(
                  `Removed "${item.title.split(" ").slice(0, 6).join(" ")}..." from the queue`,
              )
            : alert("Failed to remove item.");
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div>
    <clickable
        onclick={() => {
            if (browser) window.open(item.url, "_blank");
        }}
        title={item.url}
    >
        <Row
            widthPx="fit"
            heightPx="fit"
            gapEm={0.66}
            justifyContent="flex-start"
            textWrap
        >
            {#if item.image_url}
                <img
                    src={item.image_url}
                    alt="Square image displaying the product '{item.title}'"
                />
            {/if}

            <Column gapEm={0.1} alignItems="flex-start" widthPx="fit">
                <Row>
                    <Text maxLines={1} weight="bold"
                        >{item.title.split(" ").slice(0, 6).join(" ")}...</Text
                    >
                    {#if item.categories.length > 0}
                        <Row widthPx="fit" heightPx="fit" gapEm={0.66} textWrap>
                            {#each item.categories.slice(-1) as category}
                                <category>
                                    <Text inheritColor maxLines={1}
                                        >{category}</Text
                                    >
                                </category>
                            {/each}
                        </Row>
                    {/if}
                </Row>

                <Text maxLines={1} classList={["italic"]}
                    >by @{item.added_by_username}</Text
                >
            </Column>
        </Row>
    </clickable>
    <Row widthPx="fit" heightPx="fit" gapEm={0.66} textWrap>
        <Text maxLines={1} weight="bold" sizeEm={1.66}
            >{item.price_symbol}{item.price.toLocaleString()}</Text
        >
        <Button
            label="Delete"
            type="danger"
            onclick={async () => {
                await removeItem(item.asin);
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
