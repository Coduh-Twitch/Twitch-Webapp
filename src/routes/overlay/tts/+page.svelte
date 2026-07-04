<script lang="ts">
    import { page } from "$app/state";
    import type { TTSQueueItem } from "$lib/types";
    import { onMount } from "svelte";

    async function fetchQueue(): Promise<TTSQueueItem[]> {
        let res = await (await fetch(`/api/tts/queue`)).json();
        return res || [];
    }

    async function skipTTS(id?: string): Promise<void> {
        if (!id && !currentQueueItem) return;
        let res = await (
            await fetch(`/api/tts/skip/${id ? id : currentQueueItem?.id}`, {
                method: "POST",
            })
        ).json();
        if (audio) audio.pause();
        playing = false;
        currentQueueItem = null;
        return res || [];
    }

    async function endTTS(id?: string): Promise<void> {
        if (!id && !currentQueueItem) return;
        let res = await (
            await fetch(`/api/tts/end/${id ? id : currentQueueItem?.id}`, {
                method: "POST",
            })
        ).json();
        if (audio && !audio.paused) audio.pause();
        playing = false;
        currentQueueItem = null;
        return res || [];
    }

    async function speak(itemId: string) {
        console.log("attempting to speak", currentQueueItem);
        let res = await fetch(`/api/tts/speak`, {
            method: "POST",
            body: JSON.stringify(currentQueueItem),
            headers: { "Content-Type": "audio/mpeg" },
        });

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
            await skipTTS(currentQueueItem?.id);
            return;
        }

        const url = URL.createObjectURL(blob);
        console.log(url);

        if (audio) {
            URL.revokeObjectURL(audio.src);
            audio.pause();
        }

        audio = new Audio(url);
        audio.volume = 0.08;
        audio.play();

        audio.onplay = () => {
            playing = true;
        };

        audio.onended = async () => {
            await endTTS(itemId);
            setTimeout(() => {
                playing = false;
            }, 3e3);
        };
    }

    let queue: TTSQueueItem[] = $state([]);
    let playing = $state(false);

    let currentQueueItem: TTSQueueItem | null = $state(null);
    let audio: HTMLAudioElement;

    onMount(() => {
        let interval = setInterval(async () => {
            queue = await fetchQueue();
            if (
                currentQueueItem &&
                ((playing && queue[0] && queue[0].id !== currentQueueItem.id) ||
                    !queue[0])
            ) {
                console.log("CURRENT ITEM", currentQueueItem.id);
                await skipTTS(currentQueueItem.id);
            }
            if (!playing && queue[0]) {
                if (queue[0].isTos) {
                    await skipTTS(queue[0].id);
                } else {
                    currentQueueItem = queue[0];
                    await speak(currentQueueItem.id);
                }
            }
        }, 3e3);

        return () => {
            console.log("Cleared Interval");
            clearInterval(interval);
        };
    });
</script>

{#if playing && page.url.hostname.includes("localhost")}
    <h1>{currentQueueItem?.content}</h1>
{/if}
<audio bind:this={audio} autoplay volume={0.3}></audio>
