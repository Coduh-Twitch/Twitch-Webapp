<script lang="ts">
    import { PUBLIC_MOBILE_SIZE_PX } from "$env/static/public";
    import {
        DBQueueRoles,
        type DBLeaderboardMember,
        type DBQueueMember,
    } from "$lib/types";
    import { Row, Column, Text, Heading } from "duckylib";
    import { MediaQuery } from "svelte/reactivity";

    interface LeaderboardMemberProps {
        member: DBLeaderboardMember;
        position: number;
    }

    const { member, position }: LeaderboardMemberProps = $props();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeStyle: "long",
        timeZone: "America/New_York",
    });

    const truncate = (input: string, length: number = 5) =>
        input.length > length ? `${input.substring(0, length - 3)}...` : input;

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

    let mobileQuery = new MediaQuery(`max-width: ${PUBLIC_MOBILE_SIZE_PX}px`);
</script>

<div title="{member.username} at position #{position}">
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
                <Row widthPx="fit" heightPx="fit" gapEm={0.66} textWrap>
                    <Text sizeEm={1.1} classList={["yellow"]} weight="black"
                        >{position === 1
                            ? "🥇"
                            : position === 2
                              ? "🥈"
                              : position === 3
                                ? "🥉"
                                : ordinalSuffix(position)}</Text
                    >
                </Row>
                <Text maxLines={1} weight="bold"
                    >{mobileQuery.current
                        ? truncate(member.username, 20)
                        : member.username}</Text
                >
            </Row>

            <Text maxLines={1} classList={["italic"]}
                >{member.points.toLocaleString()} pt{member.points === 1
                    ? ""
                    : "s"}</Text
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
        /*filter: grayscale();*/
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
