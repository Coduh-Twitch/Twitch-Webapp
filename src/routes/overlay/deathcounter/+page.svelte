<script lang="ts">
    import { SlopMode, type ApiResponse, type DBAppConfig } from "$lib/types";
    import { Button, Column, getUserData, Heading, Text, Row } from "duckylib";
    import { onMount } from "svelte";
    import glorp from "$lib/assets/emotes/glorp.png";
    import dummy from "$lib/assets/emotes/coduhNotSmart.png";
    import kiss from "$lib/assets/emotes/catKiss.avif";
    import twerk from "$lib/assets/emotes/duckTwerk.avif";
    import spank from "$lib/assets/emotes/dittoSlap.gif";
    import joel from "$lib/assets/emotes/joel.avif";
    import crunch from "$lib/assets/emotes/crunch.avif";
    import joelpride from "$lib/assets/emotes/joelpride.avif";
    import glorpa from "$lib/assets/emotes/glorpa.png";
    import L from "$lib/assets/emotes/LL.avif";
    import smoke from "$lib/assets/emotes/SMOKE.avif";
    import pow from "$lib/assets/emotes/catPOW.avif";
    import what from "$lib/assets/emotes/WHAT.avif";
    import catjam from "$lib/assets/emotes/catJAM.avif";
    import noooo from "$lib/assets/emotes/NOOOO.avif";
    import cookie from "$lib/assets/emotes/cookieOhYeah.gif";

    async function getAppConfig(): Promise<DBAppConfig | null> {
        const res: ApiResponse<DBAppConfig | null> = await (
            await fetch(`/api/bot/config`)
        ).json();

        return res.data;
    }

    let emotes = [
        glorp,
        dummy,
        kiss,
        twerk,
        crunch,
        glorpa,
        smoke,
        pow,
        what,
        catjam,
        noooo,
        joel,
        joelpride,
    ];

    let emote = $state(
        emotes[Math.floor(Math.random() * emotes.length)] || pow,
    );

    let config: DBAppConfig | null = $state(null);

    let mode: "stuck" | "deaths" | "none" = $state("deaths");
    let videoId = $state("a");

    onMount(async () => {
        config = await getAppConfig();
        mode = config?.show_death_count
            ? "deaths"
            : config?.show_stuck_count
              ? "stuck"
              : "none";

        setInterval(async () => {
            config = await getAppConfig();
            if (
                mode === "none" &&
                (config?.show_death_count || config?.show_stuck_count)
            ) {
                mode = config?.show_death_count
                    ? "deaths"
                    : config?.show_stuck_count
                      ? "stuck"
                      : "none";
            } else if (mode === "deaths" && !config?.show_death_count) {
                if (!config?.show_stuck_count) {
                    mode = "none";
                } else mode = "stuck";
            } else if (mode === "stuck" && !config?.show_stuck_count) {
                if (!config?.show_death_count) {
                    mode = "none";
                } else mode = "deaths";
            }
            if (config?.slop_mode === SlopMode.SUBWAY_SURFERS)
                videoId = "ChBg4aowzX8";
            if (config?.slop_mode === SlopMode.SOAP) videoId = "6NsvJ9P7kSU";
            if (config?.slop_mode === SlopMode.CUSTOM)
                videoId = config.custom_video_id;
        }, 3e2);

        let i = $state(0);
        setInterval(() => {
            i++;
            console.log("time to switch");
            let ran = false;
            if (mode === "deaths" && config?.show_stuck_count) {
                mode = "stuck";
                ran = true;
            }
            if (mode === "stuck" && !ran && config?.show_death_count) {
                mode = "deaths";
                ran = true;
            }
            if (i === 2) {
                i = 0;
                emote =
                    emotes[Math.floor(Math.random() * emotes.length)] || pow;
            }
        }, 10e3);
    });
</script>

<div
    class="container{!config?.show_death_count && !config?.show_stuck_count
        ? ' hidden'
        : ' showing'}"
>
    {#if !config?.slop_mode || ((config?.slop_mode || 0) as SlopMode) === SlopMode.NONE}
        <img src={emote} />
        {#if mode === "deaths"}
            <h1>Deaths:</h1>
            <h1>
                {(config?.death_count || 0) === 67
                    ? `67 :(`
                    : config?.death_count === 69
                      ? "69 ;)"
                      : (config?.death_count || 0).toLocaleString()}
            </h1>
        {:else if mode === "stuck"}
            <h1>
                Stuck: {config?.stuck_count || 0} Time{(config?.stuck_count ||
                    0) === 1
                    ? ""
                    : "s"}
            </h1>
        {/if}
    {:else}
        <iframe
            width="200"
            height="113"
            src="https://www.youtube.com/embed/{videoId}?autoplay=1&mute=1&rel=0&modestbranding&loop=1"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
        ></iframe>
    {/if}
    <!-- <img src={twerk} />
    <h1>"coduh stinks" in chat</h1> -->
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&family=Do+Hyeon&display=swap");

    @keyframes fadeIn {
        from {
            opacity: 0;
            display: none;
        }

        to {
            opacity: 1;
            display: flex;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            display: flex;
        }

        to {
            opacity: 0;
            display: none;
        }
    }

    .container {
        padding-left: 0.2em;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: flex-start;
        gap: 0.5em;
    }

    img {
        height: 4em;
        aspect-ratio: 1/1;
    }

    h1 {
        font-size: 4em;
        margin-bottom: 0.15em;
        /*margin-left: 0.1em;*/
        line-height: 0.8em;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        /*font-family: "Comic Relief";*/
        font-weight: bold;
        color: white;
        -webkit-text-stroke: 2.5px black;
        text-shadow: 2px 2px 5px black;
    }

    .hidden {
        animation: 1s fadeOut forwards;
    }

    .showing {
        animation: 1s fadeIn forwards;
    }
</style>
