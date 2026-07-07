<script lang="ts">
    import { page } from "$app/state";
    import type {
        ApiResponse,
        DBSoundAlertQueueItem,
        TTSQueueItem,
    } from "$lib/types";
    import { Column, Text } from "duckylib";
    import { onMount } from "svelte";

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

    async function fetchSpoofifyConfig(): Promise<typeof defaultConfig> {
        let res: ApiResponse<any | null> = await (
            await fetch(`/api/spoofify/config`)
        ).json();
        return res.data || defaultConfig;
    }

    async function fetchQueue(): Promise<DBSoundAlertQueueItem[]> {
        let res = await (await fetch(`/api/soundalerts/queue`)).json();
        return res || [];
    }

    async function endAlert(id?: string): Promise<void> {
        if (!id && !currentQueueItem) return;
        let res = await (
            await fetch(
                `/api/soundalerts/end/${id ? id : currentQueueItem?.id}`,
                {
                    method: "POST",
                },
            )
        ).json();
        if (audio && !audio.paused) audio.pause();
        playing = false;
        currentQueueItem = null;
        return res || [];
    }

    async function soundAlert(itemId: string) {
        console.log("attempting to speak", currentQueueItem);
        let res = await fetch(`${currentQueueItem?.audio_path}`);

        if (!res.ok) return;
        console.log(res);
        let buffer = await res.arrayBuffer();
        let blob = new Blob([buffer], { type: "audio/mpeg" });

        if (blob.type !== "audio/mpeg") {
            console.error("Expected audio/mpeg but got:", blob.type);
            return;
        }

        if (!res) {
            playing = false;
            await endAlert(currentQueueItem?.id);
            return;
        }

        const url = URL.createObjectURL(blob);
        console.log(url);

        if (audio) {
            URL.revokeObjectURL(audio.src);
            audio.pause();
        }

        audio.src = url;
        audio.volume = 0.3;

        audio.play();

        audio.onplay = () => {
            playing = true;
            audioPlaying = true;
        };

        audio.onended = async () => {
            audioPlaying = false;
            setTimeout(async () => {
                await endAlert(itemId);
                if (!audioPlaying) playing = false;
            }, 3e3);
        };
    }

    let queue: DBSoundAlertQueueItem[] = $state([]);
    let playing = $state(false);
    let audioPlaying = $state(false);

    let currentQueueItem: DBSoundAlertQueueItem | null = $state(null);
    let audio: HTMLAudioElement;

    let spoofifyConfig: typeof defaultConfig = $state(defaultConfig);

    onMount(() => {
        let isFetching = false;

        let interval = setInterval(async () => {
            if (isFetching) return;
            isFetching = true;

            try {
                spoofifyConfig = await fetchSpoofifyConfig();
                queue = await fetchQueue();
                if (
                    currentQueueItem &&
                    ((playing &&
                        queue[0] &&
                        queue[0].id !== currentQueueItem.id) ||
                        !queue[0])
                ) {
                    await endAlert(currentQueueItem.id);
                }
                if (!playing && queue[0]) {
                    currentQueueItem = queue[0];
                    await soundAlert(currentQueueItem.id);
                }
            } finally {
                isFetching = false;
            }
        }, 3000);

        return () => {
            console.log("Cleared Interval");
            clearInterval(interval);
        };
    });
</script>

<div
    style={`background-color: ${spoofifyConfig?.color_1}df;
color: ${spoofifyConfig?.text_color || "white"};
border-radius: ${spoofifyConfig.border_radius}px;
border: ${spoofifyConfig.stroke_width / 2}px solid ${spoofifyConfig.stroke_color};`}
    class={playing && audioPlaying ? "in" : "out"}
>
    <img src="/assets/coduhDummy.png" alt="" />
    <Column
        heightPx="fit"
        widthPx="fit"
        alignItems="flex-start"
        justifyContent="center"
        gapEm={0.2}
    >
        <Text sizeEm={1.2} weight="bolder"
            >@{currentQueueItem?.sent_by_username}</Text
        >
        <Text sizeEm={1} weight="semibold"
            >{currentQueueItem?.alert_name
                .split("Sound Alert: ")[1]
                .trim()}</Text
        >
    </Column>
</div>
<audio bind:this={audio} autoplay volume={0.3}></audio>

<style>
    div {
        transition: all 0.75s;
        height: fit-content;
        min-height: 40px;
        min-width: 200px;
        width: fit-content;
        padding: 0.66em 1.66em;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 1em;
    }

    img {
        height: 3em;
        border-radius: var(--border-lg);
        aspect-ratio: 1/1;
    }

    .in {
        opacity: 1;
    }

    .out {
        opacity: 0;
    }
</style>
