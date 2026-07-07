<script lang="ts">
    import type { TwitchCustomReward } from "$lib/types";
    import { Column, Row, Symbol, Text } from "duckylib";

    interface CustomRewardProps {
        reward: TwitchCustomReward;
    }

    let { reward }: CustomRewardProps = $props();

    let showButtons = $state(false);

    async function deleteReward(): Promise<boolean> {
        return false;
    }
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    style:background-color={reward.background_color}
    style:filter={reward.is_enabled ? "none" : "grayscale()"}
    class="reward"
    onmouseenter={() => {
        showButtons = true;
    }}
    onmouseleave={() => {
        showButtons = false;
    }}
>
    <div
        class="buttons"
        style:display={showButtons ? "none" : "none"}
        onclick={async () => {
            let r = await deleteReward();
            r
                ? window.location.reload()
                : alert(`Failed to delete reward "${reward.title}"`);
        }}
    >
        <Row
            widthPx="fit"
            heightPx="fit"
            alignItems="center"
            justifyContent="center"
            textWrap
        >
            <div class="button" id="delete">
                <Symbol name="delete" inheritColor={true} hoverEffect={false} />
            </div>
            <Text weight="black" maxLines={1}>Delete</Text>
        </Row>
    </div>
    <Column textWrap={true} gapEm={0.33}>
        <img src={reward.image ? reward.image : reward.default_image.url_1x} />
        <Text maxLines={1} sizeEm={1} weight="bold" inheritColor={true}
            >{reward.title.split("Sound Alert: ")[1].trim()}</Text
        >
        <Text
            maxLines={1}
            sizeEm={0.9}
            weight="black"
            inheritColor={true}
            classList={reward.is_enabled ? [] : ["strike"]}
            >{reward.cost.toLocaleString()} Channel Point{reward.cost === 1
                ? ""
                : "s"}</Text
        >
        {#if !reward.is_enabled}
            <Text
                maxLines={1}
                sizeEm={0.9}
                weight="semibold"
                classList={["italic"]}
                inheritColor={true}>Reward Disabled</Text
            >
        {/if}
    </Column>
</div>

<style>
    div.reward {
        height: 100px;
        width: fit-content;
        border: 3px solid var(--surface-0);
        border-radius: var(--border-lg);
        color: white;
        padding: 0.33em 0.66em;
        position: relative;
    }

    div:hover {
        transition: all 0.3s;
        transform: scale(1.04);
        box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
        /*cursor: pointer;*/
    }

    div:not(:hover) {
        transition: all 0.3s;
        transform: scale(1);
        box-shadow: none;
    }

    .buttons {
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 40%;
        left: 20%;
        transform: translate(-50%, -50%);
        background-color: #000000d3;
        width: 100px;
        height: 30px;
        border-radius: var(--border-md);
        padding: 0.2em 0.33em;
    }

    .buttons:hover {
        #delete {
            color: var(--red);
        }
    }
</style>
