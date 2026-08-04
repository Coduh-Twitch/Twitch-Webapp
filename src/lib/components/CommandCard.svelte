<script lang="ts">
    import { PUBLIC_MOBILE_SIZE_PX } from "$env/static/public";
    import {
        UserRoles,
        type ChatCommand,
        type ChatSubCommand,
        type CustomCommand,
    } from "$lib/types";
    import { Markdown, Row, Text } from "duckylib";
    import { MediaQuery } from "svelte/reactivity";

    import badge_Mod from "$lib/assets/badges/moderator.png";
    import badge_LeadMod from "$lib/assets/badges/lead-moderator.png";
    // import badge_Chatbot from "$lib/assets/badges/chatbot.png";
    import badge_Vip from "$lib/assets/badges/vip.png";
    import badge_Broadcaster from "$lib/assets/badges/broadcaster.png";
    import { browser } from "$app/environment";

    interface CommandCardProps {
        command?: ChatCommand;
        subcommand?: ChatSubCommand;
        customCommand?: CustomCommand;
    }

    let { command, subcommand, customCommand }: CommandCardProps = $props();

    let mobileQuery = new MediaQuery(`max-width: ${PUBLIC_MOBILE_SIZE_PX}px`);
</script>

{#snippet aliases()}
    {#if command}
        <Text weight="semibold" classList={["italic"]} maxLines={1}
            >Alias{command.aliases?.length === 1 ? "" : "es"}{(command.aliases
                ?.length || 0) > 0
                ? ` (${command.aliases?.length.toLocaleString()}):`
                : ""}</Text
        >
        <Markdown
            widthPx="fit"
            content={command.aliases && command?.aliases?.length > 0
                ? `${(command.aliases as string[])
                      .filter((a) => (command?.aliases || []).indexOf(a) < 1)
                      .map((a) => `\`!${a}\``)
                      .join(
                          ", ",
                      )} ${(command?.aliases || []).length === (command.aliases as string[]).filter((a) => (command?.aliases || []).indexOf(a) < 1).length ? "" : `*(${((command?.aliases || []).length - (command.aliases as string[]).filter((a) => (command?.aliases || []).indexOf(a) < 1).length).toLocaleString()} more)*`}`
                : "None"}
        />
    {/if}
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    title="Copy {customCommand ? '' : '!'}{command?.name ||
        customCommand?.trigger}{subcommand ? ` ${subcommand.name}` : ''}"
    style="flex-direction: {mobileQuery.current
        ? 'column'
        : 'row'};text-align: {mobileQuery.current
        ? 'center'
        : 'left'} !important;"
    onclick={async () => {
        if (browser) {
            try {
                let text = `${customCommand ? "" : "!"}${
                    command?.name || customCommand?.trigger
                }${subcommand ? ` ${subcommand.name}` : ""}`;
                await window.navigator.clipboard.writeText(text);
                alert(`Copied "${text}" to clipboard`);
            } catch (e) {}
        }
    }}
>
    <Row widthPx="fit" heightPx="fit" gapEm={0.66}>
        {#if command && !subcommand}
            {#if command.userLevel !== UserRoles.DEFAULT}
                {#if command.userLevel === UserRoles.MOD}
                    <img
                        class="badge"
                        src={badge_Mod}
                        title="{command.userLevel}-Only Command"
                        alt="Twitch Moderator Badge"
                    />
                {/if}
                {#if command.userLevel === UserRoles.VIP}
                    <img
                        class="badge"
                        src={badge_Vip}
                        title="{command.userLevel}-Only Command"
                        alt="Twitch VIP Badge"
                    />
                {/if}
                {#if command.userLevel === UserRoles.BROADCASTER}
                    <img
                        class="badge"
                        src={badge_Broadcaster}
                        title="{command.userLevel}-Only Command"
                        alt="Twitch Broadcaster Badge"
                    />
                {/if}
                {#if command.userLevel === UserRoles.LEAD_MOD}
                    <img
                        class="badge"
                        src={badge_LeadMod}
                        title="{command.userLevel}-Only Command"
                        alt="Twitch Chat Lead Moderator Badge"
                    />
                {/if}
            {/if}
            <Text weight="bold"
                >!{command.name}{command.args
                    ?.map((a) => ` {${a.required ? "*" : "?"}${a.name}}`)
                    .join("")}</Text
            >

            {#if !mobileQuery.current && (command.aliases || [])?.length > 0}
                {@render aliases()}
            {/if}
        {/if}
        {#if subcommand}
            {#if subcommand.userLevel !== UserRoles.DEFAULT}
                {#if subcommand.userLevel === UserRoles.MOD}
                    <img
                        class="badge"
                        src={badge_Mod}
                        title="{subcommand.userLevel}-Only Command"
                        alt="Twitch Moderator Badge"
                    />
                {/if}
                {#if subcommand.userLevel === UserRoles.VIP}
                    <img
                        class="badge"
                        src={badge_Vip}
                        title="{subcommand.userLevel}-Only Command"
                        alt="Twitch VIP Badge"
                    />
                {/if}
                {#if subcommand.userLevel === UserRoles.BROADCASTER}
                    <img
                        class="badge"
                        src={badge_Broadcaster}
                        title="{subcommand.userLevel}-Only Command"
                        alt="Twitch Broadcaster Badge"
                    />
                {/if}
                {#if subcommand.userLevel === UserRoles.LEAD_MOD}
                    <img
                        class="badge"
                        src={badge_LeadMod}
                        title="{subcommand.userLevel}-Only Command"
                        alt="Twitch Chat Bot Badge"
                    />
                {/if}
            {/if}
            <Text weight="bold"
                >!{command?.name}
                {subcommand.name}
                {subcommand.args
                    ?.map((a) => ` {${a.required ? "*" : "?"}${a.name}}`)
                    .join("")}</Text
            >
        {/if}
        {#if customCommand}
            {#if customCommand.userLevel !== UserRoles.DEFAULT}
                {#if customCommand.userLevel === UserRoles.MOD}
                    <img
                        class="badge"
                        src={badge_Mod}
                        title="{customCommand.userLevel}-Only Command"
                        alt="Twitch Moderator Badge"
                    />
                {/if}
                {#if customCommand.userLevel === UserRoles.VIP}
                    <img
                        class="badge"
                        src={badge_Vip}
                        title="{customCommand.userLevel}-Only Command"
                        alt="Twitch VIP Badge"
                    />
                {/if}
                {#if customCommand.userLevel === UserRoles.BROADCASTER}
                    <img
                        class="badge"
                        src={badge_Broadcaster}
                        title="{customCommand.userLevel}-Only Command"
                        alt="Twitch Broadcaster Badge"
                    />
                {/if}
                {#if customCommand.userLevel === UserRoles.LEAD_MOD}
                    <img
                        class="badge"
                        src={badge_LeadMod}
                        title="{customCommand.userLevel}-Only Command"
                        alt="Twitch Chat Bot Badge"
                    />
                {/if}
            {/if}
            <Text weight="bold">{customCommand.trigger}</Text>
        {/if}
    </Row>
    {#if command && !subcommand}
        {#if mobileQuery.current && (command.aliases || [])?.length > 0}
            {@render aliases()}
        {/if}
        <Text weight="semibold" classList={["italic"]} maxLines={1}
            >{command.help}</Text
        >
    {/if}
    {#if subcommand}
        <Text weight="semibold" classList={["italic"]} maxLines={1}
            >{subcommand.help}</Text
        >
    {/if}
    {#if customCommand}
        <Text weight="semibold" classList={["italic"]} maxLines={1}
            >{customCommand.content}</Text
        >
    {/if}
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
        cursor: copy;
    }

    .badge {
        width: 1.1em;
        aspect-ratio: 1/1;
    }
</style>
