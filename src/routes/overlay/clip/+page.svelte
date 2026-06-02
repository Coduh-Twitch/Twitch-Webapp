<script lang="ts">
    import type { ApiResponse, DBClip, DBNotice, DBTimer } from "$lib/types";
    import { onMount } from "svelte";
    import moment from "moment";
    import durationFormat from "moment-duration-format";
    import { Column, Row, Symbol, Text } from "duckylib";
    import { page } from "$app/state";
    import { browser } from "$app/environment";
    import { date } from "drizzle-orm/mysql-core";

    durationFormat(moment);

    let defaultConfig = {
        id: "9afc884d-85c8-4d33-bb69-8135993ac26e",
        background_mode: "gradient",
        animation_style: "slide",
        stroke_width: 4,
        border_radius: 40,
        color_1: "#010101",
        color_2: "#ae4fc9",
        shadow_color: "#561269",
        text_color: "#f9f9f9",
        stroke_color: "#37aac6",
        show_album: true,
    };

    let defaultClip: DBClip = {
        id: "ClipNotFound",
        title: "No Clips Found :(",
        createdDate: new Date(),
        creatorId: "1234",
        creatorName: "ShortBotduh",
        embedUrl: `https://twitch.tv/`,
        featured: false,
        game: "Nothing",
        gameId: "1234",
        views: 0,
        channel: "nobody",
        duration_seconds: 0,
        download_url:
            "https://ducky.wiki/_app/immutable/assets/duckypfptransparent.DjoImAvR.png",
        portrait_download_url: null,
        creator_profile_image: "https://ducky.wiki/_app/immutable/assets/duckypfptransparent.DjoImAvR.png"
    };

    async function fetchClip(): Promise<DBClip> {
        let res: ApiResponse<DBClip> = await (await fetch(`/api/clip`)).json();
        return res.data;
    }

    async function fetchClipVisibility(): Promise<boolean> {
        let res: ApiResponse<boolean> = await (
            await fetch(`/api/clip/visible`)
        ).json();
        return res.data || false;
    }

    async function clipFinished(): Promise<void> {
        await (await fetch(`/api/clip/next?clip=${clip.id}`, { method: "POST" })).json();
    }

    async function fetchSpoofifyConfig(): Promise<typeof defaultConfig> {
        let res: ApiResponse<any | null> = await (
            await fetch(`/api/spoofify/config`)
        ).json();
        return res.data || defaultConfig;
    }

    let showTimeAnyway = $state(false);
    let expirationTimeout: NodeJS.Timeout | null = $state(null);

    onMount(async () => {
        clip = await fetchClip();
        clipVisible = await fetchClipVisibility();

        if(clip.download_url) download_url = clip.download_url;

        spoofifyConfig = await fetchSpoofifyConfig();

        setInterval(async () => {
            clip = await fetchClip();
            clipVisible = await fetchClipVisibility();

            if (!clip || clip.id === "ClipNotFound") await clipFinished();

            if(clip.download_url) download_url = clip.download_url;

            spoofifyConfig = await fetchSpoofifyConfig();

            // if(notice.visible && !expirationTimeout) {
            //     expirationTimeout = setTimeout(() => {

            //     },30e3)
            // }
            // if(!notice.visible && expirationTimeout) {
            //     clearTimeout(expirationTimeout);
            //     expirationTimeout = null;
            // }
        }, 20e3);

        // if(browser) {
        //     document.querySelector("body")?.click();
        //     document.getElementById("frame")?.click();
        // }
        reset_home = false;
    });

    let clip: DBClip = $state(defaultClip);
    let clipVisible: boolean = $state(false);
    let spoofifyConfig: typeof defaultConfig = $state(defaultConfig);
    let download_url: string | null = $state(null)
    let reset_home: boolean = $state(true);


</script>

{#if clip && clip.id !== "ClipNotFound" && download_url}
    <div
        class="clip-info dark {clipVisible ? 'visible' : 'hidden'}"
        style={`
        background-color: ${spoofifyConfig?.color_1}df;
        color: ${spoofifyConfig?.text_color || "white"};
        border-radius: ${spoofifyConfig.border_radius}px;
        border: ${spoofifyConfig.stroke_width / 2}px solid ${spoofifyConfig.stroke_color};
        word-break: break-all;
        
    `}
    >
        <!-- <Text weight="bolder" maxLines={1} sizeEm={1.66}>🎮 {clip.game}</Text> -->
        <Text weight="bolder" maxLines={1} sizeEm={1.66}>{clip.title}</Text>
        
        
        <Row widthPx="fit" heightPx="fit" alignItems="center" justifyContent="center" gapEm={1}>
            <Text weight="bold" maxLines={1} sizeEm={1}
                >{(new Date(clip.createdDate)).toLocaleDateString("en-US", {dateStyle: "long"})}</Text
            >
            <!-- {clip.createdDate} -->
            <img src="{clip.creator_profile_image}" alt="by @{clip.creatorName}" width="36px" style="border-radius: {spoofifyConfig.border_radius}px;">
        
        </Row>
    </div>
    {#key download_url}
        <div class="video">
            <!-- svelte-ignore a11y_media_has_caption -->
            <!-- svelte-ignore a11y_missing_attribute -->
            <!-- <iframe
                id="frame"
                onload={async (e) => {
                    console.log("clip duration", clip.duration_seconds);
                    if (clip && clip.duration_seconds !== 0) {
                        setTimeout(
                            async () => {
                                if (clip.id !== "ClipNotFound")
                                    await clipFinished();
                            },
                            Math.floor((clip.duration_seconds + 2) * 1000),
                        );
                    }
                }}
                src="{clip.embedUrl}&parent={page.url
                    .hostname}&autoplay=true&muted=true&width=1920&height=1080"
                allow="autoplay; fullscreen; encrypted-media"
                allowfullscreen={false}
                width="99%"
                height="100%"
                style="aspect-ratio: 16/9;border-radius: {spoofifyConfig.border_radius}px;border: {spoofifyConfig.stroke_width /
                    2}px solid {spoofifyConfig.stroke_color};margin-left:auto;margin-right:auto;"
            ></iframe> -->
            <video src="{download_url}" style="aspect-ratio: 16/9;border-radius: {spoofifyConfig.border_radius}px;border: {spoofifyConfig.stroke_width /
                    2}px solid {spoofifyConfig.stroke_color};margin-left:auto;margin-right:auto;" height="99%" width="99%" autoplay muted={false}
                    loop={false} onplaying={async (e) => {
                    console.log("clip duration", clip.duration_seconds);
                    clipVisible = true;
                    setTimeout(() => {
                        clipVisible = false;
                    },5e3)
                    if (clip && clip.duration_seconds !== 0) {
                        setTimeout(
                            async () => {    
                                console.log("Playback Ended")
                                console.log("[DEBUG]", "Refreshing Clip")
                                await clipFinished();     
                            },
                            Math.floor((clip.duration_seconds) * 1000),
                        );
                    }
                }} onended={async () => {
                    
                }} controls={false}>

            </video>
        </div>
    {/key}
{/if}

<style>
    @keyframes fadeOut {
        from {
            opacity: 1;
        }

        to {
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes flashToSolid {
        0%,
        50%,
        100% {
            opacity: 1;
        }
        25%,
        75% {
            opacity: 0;
        }
    }

    .video {
        width: 100%;
        height: 100%;
    }

    .clip-info {
        /* margin-left: auto;
        margin-right: auto;
        width: fit-content; */
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        padding: 0.66em 1.66em;
        align-items: center;
        justify-content: space-between;
        gap: 1em;
        position: absolute;
        top: 1em;
        width: 80%;
        left: 7.5%;
    }

    .pausing {
        animation: 3s flashToSolid linear forwards;
    }

    .duration {
        min-width: fit-content !important;
    }

    .visible {
        animation: 1.2s fadeIn linear forwards;
    }

    .hidden {
        animation: 1.2s fadeOut ease-in-out forwards;
    }
</style>
