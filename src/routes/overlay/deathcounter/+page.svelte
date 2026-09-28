<script lang="ts">
    import { type ApiResponse, type DBCounter } from "$lib/types";
    import { onMount } from "svelte";
    import glorp from "$lib/assets/emotes/glorp.png";
    import dummy from "$lib/assets/emotes/coduhNotSmart.png";
    import kiss from "$lib/assets/emotes/catKiss.avif";
    import twerk from "$lib/assets/emotes/duckTwerk.avif";
    import joel from "$lib/assets/emotes/joel.avif";
    import crunch from "$lib/assets/emotes/crunch.avif";
    import joelpride from "$lib/assets/emotes/joelpride.avif";
    import glorpa from "$lib/assets/emotes/glorpa.png";
    import smoke from "$lib/assets/emotes/SMOKE.avif";
    import pow from "$lib/assets/emotes/catPOW.avif";
    import what from "$lib/assets/emotes/WHAT.avif";
    import catjam from "$lib/assets/emotes/catJAM.avif";
    import noooo from "$lib/assets/emotes/NOOOO.avif";
    import { page } from "$app/state";

    async function fetchCounter(id: string): Promise<DBCounter> {
      const res: ApiResponse<DBCounter> = await (await fetch(`/api/counters/${id}`)).json();
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

    let counter: DBCounter | null = $state(null);

    let label: string = $state(page.url.searchParams.get("label") || "Deaths:")
    let fontSize: number = $state(parseFloat(page.url.searchParams?.get("fontSize") || "4") || 4);
    let withEmote: boolean = $state((page.url.searchParams?.get("withEmote") || "true") === "true");
    let withOutline: boolean = $state((page.url.searchParams?.get("withOutline") || "true") === "true");
    let color: string = $state(page.url.searchParams.get("color") || "white")

    $effect(() => {
      if(color.length === 6 && !color.startsWith("#")) color = `#${color}`;
    })

    onMount(async () => {
        counter = await fetchCounter("deaths");

        setInterval(async () => {
            counter = await fetchCounter("deaths");
        }, 3e2);
    });
</script>

<div
    class="container"
>
        {#if withEmote}
            <img src={emote} style:height={`${fontSize}em`} alt="emote" />
        {/if}
            <h1 style:font-size={`${fontSize}em`} style:color={color}>{label}</h1>
            <h1 style:font-size={`${fontSize}em`} style:color={color}>
                {(counter?.count || 0) === 67
                    ? `67 :(`
                    : counter?.count === 69
                      ? "69 ;)"
                      : (counter?.count || 0).toLocaleString()}
            </h1>
</div>

{#if withOutline}
    <style>
        h1 {
            -webkit-text-stroke: 2.5px black;
        }
    </style>
{/if}

<style>
    /*Default font*/
    @import url("https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&family=Do+Hyeon&display=swap");

    /*BOTW special font*/
    @font-face {
        font-family: "triforce";
        src: url("$lib/assets/font/breath_of_the_wild.otf") format("opentype");
        font-weight: normal;
        font-style: normal;
    }

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
        align-items: center;
        justify-content: flex-start;
        gap: 0.5em;
    }

    img {
        aspect-ratio: 1/1;
    }

    h1 {
        letter-spacing: 0.1em;
        font-family: "triforce", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        text-shadow: 2px 2px 5px black;
    }
</style>
