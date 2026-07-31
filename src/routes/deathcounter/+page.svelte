<script lang="ts">
    import { SlopMode, type ApiResponse, type DBAppConfig } from "$lib/types";
    import {
        Button,
        Column,
        getUserData,
        Heading,
        Text,
        Row,
        HorizontalRule,
    } from "duckylib";
    import { onMount } from "svelte";
    import kiss from "$lib/assets/emotes/catKiss.avif";

    async function getAppConfig(): Promise<DBAppConfig | null> {
        const res: ApiResponse<DBAppConfig | null> = await (
            await fetch(`/api/bot/config`)
        ).json();

        return res.data;
    }

    async function setCount(newCount: number): Promise<void> {
        const res = await (
            await fetch(`/api/bot/config/updatecount/death/${newCount}`, {
                method: "POST",
            })
        ).json();
    }

    async function setStuck(newCount: number): Promise<void> {
        const res = await (
            await fetch(`/api/bot/config/updatecount/stuck/${newCount}`, {
                method: "POST",
            })
        ).json();
    }

    async function toggleDeathVisibility(): Promise<void> {
        const res = await (
            await fetch(`/api/bot/config/togglevisibility/deaths`, {
                method: "POST",
            })
        ).json();
    }

    async function toggleStuckVisibility(): Promise<void> {
        const res = await (
            await fetch(`/api/bot/config/togglevisibility/stuck`, {
                method: "POST",
            })
        ).json();
    }

    async function setSlopMode(mode: SlopMode): Promise<void> {
        const res = await (
            await fetch(`/api/bot/config/slopmode/${mode}`, {
                method: "POST",
            })
        ).json();
    }

    let config: DBAppConfig | null = $state(null);

    onMount(async () => {
        config = await getAppConfig();

        setInterval(async () => {
            config = await getAppConfig();
        }, 3e2);
    });
</script>

<Column
    widthPx="fit"
    heightPx="fit"
    justifyContent="center"
    alignItems="center"
    textAlign="left"
>
    {#if !getUserData()}
        <Heading size={4} weight="bold">Please use the "Log In" button.</Heading
        >
    {:else}
        <Heading size={4} weight="bold"
            >Hello, {getUserData()?.username}!</Heading
        >
        <img src={kiss} />

        {#if config !== null}
            <Text>Current Death Counter</Text>
            <Heading>{config.death_count.toLocaleString()}</Heading>
            <Row justifyContent="center" flexWrap>
                <Button
                    label="+1"
                    type="success"
                    size="large"
                    onclick={async () => {
                        await setCount((config?.death_count || 0) + 1);
                    }}
                />
                <Button
                    label="-1"
                    type="danger"
                    size="large"
                    onclick={async () => {
                        if ((config?.death_count || 0) > 0)
                            await setCount((config?.death_count || 0) - 1);
                    }}
                />
                <Button
                    label="RESET TO 0"
                    type="secondary"
                    size="normal"
                    onclick={async () => {
                        if ((config?.death_count || 0) > 0) await setCount(0);
                    }}
                />
                <Button
                    label={config.show_death_count
                        ? "Hide Count"
                        : "Show Counter"}
                    type={config.show_death_count ? "danger" : "success"}
                    onclick={async () => await toggleDeathVisibility()}
                />
            </Row>
            <HorizontalRule />
            <Text>Current Stuck Counter</Text>
            <Heading>{config.stuck_count.toLocaleString()}</Heading>
            <Row justifyContent="center" flexWrap>
                <Button
                    label="+1"
                    type="success"
                    size="large"
                    onclick={async () => {
                        await setStuck((config?.stuck_count || 0) + 1);
                    }}
                />
                <Button
                    label="-1"
                    type="danger"
                    size="large"
                    onclick={async () => {
                        if ((config?.stuck_count || 0) > 0)
                            await setStuck((config?.stuck_count || 0) - 1);
                    }}
                />
                <Button
                    label="RESET TO 0"
                    type="secondary"
                    size="normal"
                    onclick={async () => {
                        if ((config?.stuck_count || 0) > 0) await setStuck(0);
                    }}
                />
                <Button
                    label={config.show_stuck_count
                        ? "Hide Count"
                        : "Show Counter"}
                    type={config.show_stuck_count ? "danger" : "success"}
                    onclick={async () => await toggleStuckVisibility()}
                />
            </Row>
            <HorizontalRule />
            <Text>Slop Mode</Text>
            <!-- <Heading>{config.stuck_count.toLocaleString()}</Heading> -->
            <Row justifyContent="center" flexWrap>
                <Button
                    label="Subway Surfers"
                    type={config.slop_mode === SlopMode.SUBWAY_SURFERS
                        ? "success"
                        : "secondary"}
                    size="normal"
                    onclick={async () =>
                        await setSlopMode(SlopMode.SUBWAY_SURFERS)}
                />
                <Button
                    label="Soap Cutting"
                    type={config.slop_mode === SlopMode.SOAP
                        ? "success"
                        : "secondary"}
                    size="normal"
                    onclick={async () => await setSlopMode(SlopMode.SOAP)}
                />
                <Button
                    label="None (Hide Slop)"
                    type={config.slop_mode === SlopMode.NONE
                        ? "success"
                        : "secondary"}
                    size="normal"
                    onclick={async () => await setSlopMode(SlopMode.NONE)}
                />
            </Row>
        {/if}
    {/if}
</Column>
