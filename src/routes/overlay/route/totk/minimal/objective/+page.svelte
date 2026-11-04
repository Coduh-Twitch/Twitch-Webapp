<script lang="ts">
    import { page } from "$app/state";
    import TotkQuestIcon from "$lib/components/TotkQuestIcon.svelte";
    import { AppConfig } from "$lib/config";
    import { onMount } from "svelte";

    let objective: string = $state(page.url.searchParams.get("objective") || "none");
    let description: string = $state(page.url.searchParams.get("description") || "none");

    let completed = $state(page.url.searchParams.get("completed") === "true");
    let failed = $state(!completed && page.url.searchParams.get("failed") === "true");

    onMount(async () => {
      objective = page.url.searchParams.get("objective") || "none";
      description = page.url.searchParams.get("description") || "none";
      completed = page.url.searchParams.get("completed") === "true";
      failed = !completed && page.url.searchParams.get("failed") === 'true';

    })

</script>

    <div class="container">
{#if objective !== "none"}

            <div class="top notif-in" style:padding-bottom={(completed || failed) ? "0" : "20px"}>
                <div class="column">
                    <div class="row">
                        <div class="row">
                            <!-- <img id="icon" src={questIcon} alt=""> -->
                            <TotkQuestIcon fill={failed ? AppConfig.colors.totk_red : AppConfig.colors.totk} />
                            <h1 style={failed ? `--text-effect: ${AppConfig.colors.botw_red};` : ""}>OBJECTIVE{completed ? " COMPLETE!" : failed ? " FAILED" : ""}</h1>
                        </div>
                        <div class="row">
                            <h3 style:color="var(--text)">{objective.toUpperCase()}</h3>
                        </div>
                    </div>
                        {#if description !== "none" && (!completed && !failed)}
                            <div class="row">
                                <p class='description'>{description.toUpperCase()}</p>
                            </div>
                        {/if}
                </div>

            </div>

{/if}
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

    /*BOTW special font*/
    @font-face {
        font-family: "triforce";
        src: url("$lib/assets/font/breath_of_the_wild.otf") format("opentype");
        font-weight: normal;
        font-style: normal;
    }

    .container {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: "triforce";
        text-align: center;
    }

    :root {
        --bg-dark: #26433D;
        --bg-dark-full: #1d332e;
        --bg: #26433D;
        --border: green;

        --text-effect: #FFFDE3;
        --text-faded: #30544C;

        --text-dark: #FFFDE3;
        --text: #FFF;

    }

    h1 {
        letter-spacing: 2px;
        font-size: 1.66em;
        color: var(--text-effect);
    }

    h1#large {
        font-size: 1.88em;
    }

    h2 {
        font-size: 1.66em;
        color: var(--text-dark);
        letter-spacing: 2px !important;
    }

    .objective {
        color: var(--text-effect);
        /*text-shadow: 0px 0px 2px var(--text-faded);*/
        letter-spacing: 3px;
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
        font-size: 1.66em;
        color: var(--text-dark);
        letter-spacing: 1px !important;
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

    .overlay {
        margin: 10px;
        width: 90%;
        height: fit-content;
        aspect-ratio: 20/8 !important;
        background-color: var(--bg-dark);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        border-radius: 8px;
    }

    .top {
        box-shadow: 0px 0px 30px 3px var(--bg-dark);
        width: 90%;
        background-color: var(--bg);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        text-align: left !important;
        background: linear-gradient(to bottom,
        var(--bg),
        var(--bg-dark-full)
        );
        background-image: url('$lib/assets/totk_pattern.png');
        background-size: 50%;
        background-position: 0 0;
    }

    .row {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.33em;
    }

    .column {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.33em;
        text-align: center;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }

        to {
            opacity: 0;
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
        animation: 1s fadeIn ease-in forwards;
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
