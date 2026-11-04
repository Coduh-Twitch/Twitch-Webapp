<script lang="ts">
    import { page } from "$app/state";
    import { AppConfig } from "$lib/config";
    import { onMount } from "svelte";

    let objective: string = $state(page.url.searchParams.get("objective") || "none");

    let completed = $state(page.url.searchParams.get("completed") === "true");
    let challenge = $state(page.url.searchParams.get("challenge") === "true");
    let failed = $state(!completed && page.url.searchParams.get("failed") === "true");
    let itemId = $state(page.url.searchParams.get("item") || "grass_block");

    onMount(async () => {
      objective = page.url.searchParams.get("objective") || "none";
      completed = page.url.searchParams.get("completed") === "true";
      failed = !completed && page.url.searchParams.get("failed") === 'true';
      itemId = page.url.searchParams.get("item") || "grass_block";
      challenge = page.url.searchParams.get("challenge") === "true";
    })

</script>

    <div class="container">
{#if objective !== "none"}
            <div class="toast notif-in">
                    <div class="row-between">
                        <img id="icon" src="https://blockrender.dev/render/item/{itemId}.png" alt="{itemId}">
                            <div class="column">
                                <h1 style={failed ? `--text-effect: ${AppConfig.colors.botw_red};` : challenge ? `--text-effect: ${AppConfig.colors.minecraft.pink};` : ""}>{challenge ? "CHALLENGE" : "OBJECTIVE"}{completed ? " COMPLETE!" : failed ? " FAILED" : ""}</h1>
                                <h3 style:color="var(--text)">{objective.toUpperCase()}</h3>
                            </div>
                    </div>
            </div>
{/if}
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

    /*BOTW special font*/
    @font-face {
        font-family: "minecraft";
        src: url("$lib/assets/font/Minecraftia.ttf") format("truetype");
        font-weight: normal;
        font-style: normal;
    }

    .container {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        font-family: "minecraft";
        text-align: center;
        padding-left: 1em;
    }

    :root {
        --bg-dark: #212121;
        --bg-dark-full: #423c27;
        --bg: #212121;
        --border: #555555;

        --text-effect: #FFFF00;
        --text-faded: #FCC413d3;

        --text-dark: #ffffffab;
        --text: #F5FAFA;

    }

    h1 {
        letter-spacing: 1.66px;
        font-size: 1.66em;
        color: var(--text-effect);
    }

    .description {
        font-size: 1.1em;
        text-shadow: 0px 0px 5px #4FC0FF;
        font-family: "Roboto", sans-serif;
        font-weight: 700;
        font-style: italic;
    }

    h3 {
        width: 100%;
        max-width: 500px;
        font-size: 1.2em;
        color: var(--text-dark);
        letter-spacing: 1px !important;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    p {
        width: 80%;
        font-size: 1.33em;
        color: var(--text);
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .toast {
        --scale: 3;
        --slice: 4;

        box-shadow: 0px 0px 30px 3px var(--bg-dark);
        min-width: calc(160px * var(--scale));
        min-height: calc(32px * var(--scale));
        background-color: var(--bg);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        text-align: left !important;
        border: 5px solid var(--border);
        padding: 1em;

        image-rendering: pixelated;
        border: calc(var(--slice) * var(--scale) * 1px) solid transparent;
        border-image: url('$lib/assets/advancement.png') var(--slice) fill / calc(var(--slice) * var(--scale) * 1px) stretch;
        box-sizing: border-box;
    }

    .row {
        width: fit-content;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 1em;
        text-align: left;
    }

    .row-between {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 2em;
        text-align: left;
    }

    .column {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 0.33em;
        text-align: center;
        text-align: left;
    }

    img {
        height: 5em;
        aspect-ratio: 1/1;
    }

    @keyframes fadeIn {
        from {
            transform: translateX(100vw);
        }

        to {
            opacity: 1;
            transform: translateX(0px);
        }
    }

    @keyframes fadeOut {
        from {
            transform: translateX(0);
        }

        to {
            opacity: 0;
            transform: translateX(100vw);
        }
    }

    @keyframes grow {
        0% {
            transform: scale(1);
        }

        250% {
            transform: scale(1.1);
        }

        50% {
            transform: scale(1);
        }

        75% {
            transform: scale(1.1);
        }

        100% {
            transform: scale(1);
        }
    }

    .growing {
        animation: grow 5s linear infinite;
    }


    .notif-in {
        animation: 0.5s fadeIn ease-out forwards;
    }

    .notif-out {
        animation: 1s fadeOut ease-in forwards;
    }

    .notif {
        transition: all;
        position: absolute;
        margin: 10px;
        width: 90%;
        aspect-ratio: 20/8 !important;
        background-color: var(--bg-dark-full);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        border-radius: 8px;
        box-shadow: 0px 0px 30px 3px var(--bg-dark);

        gap: 3em;

    }
</style>
