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

    async function setVideoId(id: string): Promise<void> {
        const res = await (
            await fetch(`/api/bot/config/videoid/${id}`, {
                method: "POST",
            })
        ).json();
    }

    let config: DBAppConfig | null = $state(null);
    let videoId: string = $state("");

    onMount(async () => {
        config = await getAppConfig();
        if (config?.custom_video_id) videoId = config.custom_video_id;

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
                    label="Custom"
                    type={config.slop_mode === SlopMode.CUSTOM
                        ? "success"
                        : "secondary"}
                    size="normal"
                    onclick={async () => await setSlopMode(SlopMode.CUSTOM)}
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
            {#if config.slop_mode === SlopMode.CUSTOM}
                <Row justifyContent="center" flexWrap>
                    <input
                        type="text"
                        bind:value={videoId}
                        placeholder="Enter YouTube Video ID..."
                    />
                    <Button
                        label="Set Video ID"
                        type={videoId !== "" &&
                        videoId !== config.custom_video_id
                            ? "success"
                            : "secondary"}
                        size="normal"
                        onclick={async () => {
                            if (
                                videoId !== "" &&
                                videoId !== config?.custom_video_id
                            ) {
                                await setVideoId(videoId);
                                videoId = "";
                            }
                        }}
                    />
                </Row>
                {#if videoId !== ""}
                    <Row justifyContent="center" flexWrap>
                        <iframe
                            width="190"
                            height="160"
                            src="https://www.youtube.com/embed/{videoId}?autoplay=1&mute=1&rel=0&modestbranding&loop=1"
                            title="YouTube video player"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen
                        ></iframe>
                    </Row>
                {/if}
            {/if}
        {/if}
    {/if}
</Column>
