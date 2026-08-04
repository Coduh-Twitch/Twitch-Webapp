<script lang="ts">
    import { DBQueueRoles, type DBQueueMember } from "$lib/types";
    import { Row, Column, Text } from "duckylib";

    interface QueueMemberProps {
        member: DBQueueMember;
    }

    const { member }: QueueMemberProps = $props();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeStyle: "long",
        timeZone: "America/New_York",
    });
</script>

<div title="{member.username} at position #{member.position}">
    <Row
        widthPx="fit"
        heightPx="fit"
        gapEm={0.66}
        justifyContent="flex-start"
        textWrap
    >
        <img src={member.avatar_url} alt="{member.username} profile picture" />
        <Column
            gapEm={0.1}
            alignItems="flex-start"
            justifyContent="flex-start"
            widthPx="fit"
        >
            <Row widthPx="fit" heightPx="fit">
                <Text maxLines={1} weight="bold">{member.username}</Text>
                <Row widthPx="fit" heightPx="fit" gapEm={0.66} textWrap>
                    {#if member.role !== DBQueueRoles.DEFAULT}
                        <category>
                            <Text inheritColor sizeEm={0.66} maxLines={1}
                                >{member.role === DBQueueRoles.MOD
                                    ? "MOD"
                                    : member.role === DBQueueRoles.SUBSCRIBER
                                      ? "SUB"
                                      : member.role === DBQueueRoles.VIP
                                        ? "VIP"
                                        : ""}</Text
                            >
                        </category>
                    {/if}
                    {#if member.bumped}
                        <category>
                            <Text inheritColor sizeEm={0.66} maxLines={1}
                                >BUMPED</Text
                            >
                        </category>
                    {/if}
                </Row>
            </Row>

            <Text maxLines={1} classList={["italic"]}
                >Position #{member.position} &bullet; Joined {formatter.format(
                    member.joined_at,
                )}</Text
            >
        </Column>
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
        filter: grayscale();
        /*border: 2px solid var(--overlay-0);*/
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
