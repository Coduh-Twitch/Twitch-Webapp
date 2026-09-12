<script lang="ts">
    import { browser } from "$app/environment";
    import { PUBLIC_TWITCH_CHANNEL_ID } from "$env/static/public";
    import questIcon from "$lib/assets/quest_icon.png";
    import { AppConfig } from "$lib/config";
    import getItemSound from "$lib/assets/sound/zelda_battlecomplete.flac";
    import completedSound from "$lib/assets/sound/zelda_battlecomplete.flac";
    import type { ApiResponse, DBCompletableObjective, DBCounter, DBObjective, DBRoute, DBRouteProgress } from "$lib/types";
    import { onMount } from "svelte";

    let route: DBRoute | null = $state(null);
    let progress: DBRouteProgress | null = $state(null);
    let completed: DBCompletableObjective[] = $state([]);

    const routeCategories = [
        { id: "great-plateau", order: 1 },
        { id: "seeking-guidance", order: 2 },
        { id: "zoras-domain", order: 3 },
        { id: "goron-city", order: 4 },
        { id: "rito-village", order: 5 },
        { id: "gerudo-town", order: 6 },
        { id: "masters-sword-and-past", order: 7 },
        { id: "confronting-the-calamity", order: 8 },
        { id: "shrines-and-collectibles", order: 9 },
    ];

    async function fetchRoute(): Promise<DBRoute | null> {
      const res: ApiResponse<DBRoute | null> = await (await fetch(`/api/route/botw`)).json();
      return res.data || null;
    }

    async function fetchCounter(): Promise<DBCounter> {
        const res: ApiResponse<DBCounter> = await (await fetch(`/api/counters/divine-beasts`)).json();
        return res.data;
    }

    async function fetchProgress(): Promise<DBRouteProgress | null> {
      const res: ApiResponse<DBRouteProgress | null> = await (await fetch(`/api/route/botw/progress/${PUBLIC_TWITCH_CHANNEL_ID}`)).json();
      return res.data || null;
    }

    async function fetchCompleted(): Promise<DBCompletableObjective[]> {
      const res: ApiResponse<DBCompletableObjective[] | null> = await (await fetch(`/api/route/botw/progress/${PUBLIC_TWITCH_CHANNEL_ID}/objectives/completed`)).json();
      return res.data || [];
    }

    async function completeObjective(objectiveId: string): Promise<void> {
      await fetch(`/api/route/botw/progress/${PUBLIC_TWITCH_CHANNEL_ID}/objectives/${objectiveId}/complete`, {method: "POST"})
    }

    async function unCompleteObjective(objectiveId: string): Promise<void> {
      await fetch(`/api/route/botw/progress/${PUBLIC_TWITCH_CHANNEL_ID}/objectives/${objectiveId}/uncomplete`, {method: "POST"})
    }

    let currentCategory: string = $state("great-plateau");
    let currentObjective: DBObjective | null = $state(null);
    let nextObjective: DBObjective | null = $state(null);
    let counter: DBCounter | null = $state(null);

    let sound: HTMLAudioElement;

    let featuredObjectives: string[] = $state([]);

    let lastCompleted: DBObjective | null = $state(null);
    let display = $state(false);

    function setMostRecents() {
      let nonCompleted = (route?.objectives || []).filter(o => !completed.some(c => c.objective_id === o.objective_id)).sort((a, b) => (routeCategories.find(c => c.id === a.category_id)?.order || 0) - (routeCategories.find(c => c.id === b.category_id)?.order || 0));
      let recent = nonCompleted[0];
      let next = nonCompleted[1];

      currentCategory = recent.category_id;
      currentObjective = recent;
      nextObjective = next;

      let lc = null;
      if(!lastCompleted) lc = completed.filter(c => !featuredObjectives.includes(c.objective_id)).sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())?.[0] || null;
      if(lc) lastCompleted = route?.objectives.find(o => o.objective_id === lc.objective_id) || null;
      if(lastCompleted && !featuredObjectives.includes(lastCompleted.objective_id)) {
        featuredObjectives.push(lastCompleted.objective_id);
        if(browser) window.localStorage.setItem("featured_objectives", JSON.stringify(featuredObjectives))
      }

      if(!display && lastCompleted) {
        display = true;
        setTimeout(() => {
          lastCompleted = null;
          setTimeout(() => {
            display = false;
          },5e2)
        },10e3);
      }
    }

    let isPlaying = $state(true);

    onMount(async () => {
      isObs = browser ? window.navigator.userAgent.includes("OBS") : true;
      if(browser) featuredObjectives = JSON.parse(window.localStorage.getItem("featured_objectives") || "[]");
      route = await fetchRoute();
      progress = await fetchProgress();
      completed = await fetchCompleted();
      counter = await fetchCounter();
      setMostRecents();

      setTimeout(() => {
        isPlaying = false;
      },10e3)

      setInterval(async () => {
        route = await fetchRoute();
        progress = await fetchProgress();
        completed = await fetchCompleted();
        counter = await fetchCounter();

        if(counter.count !== beasts) {
          if((counter.count !== 0) && counter.count > beasts && !isPlaying) display = true;
          beasts = counter.count;
          let isComplete = counter.count === maxBeasts;
          if(display) {
            sound.src = isComplete ? completedSound : getItemSound;
            if(!isPlaying) sound.play();
          }
          setTimeout(() => {
              display = false;
          },isComplete ? 15e3 : 10e3);
        }
        setMostRecents();
      },15e2)
    })

    let beasts: number = $state(0);
    let maxBeasts: number = $state(4);

    let isObs = $state(true);
</script>

<div class="container" style:background-color={isObs ? "transparent" : "#FF0000d3"}>
    {#if !isObs}
        <p>Divine beast tracker</p>
    {/if}
{#if route && progress && counter}
    <audio bind:this={sound} volume={0.5}></audio>

            <div class="top {display ? "notif-in" : "notif-out"}">
                <div class="row">
                    <div class="row">
                        <img id="icon" src={questIcon} alt="">
                        <h1>{beasts === maxBeasts ? "ALL DIVINE BEASTS DEFEATED!" : "DIVINE BEAST DEFEATED!"}</h1>
                    </div>
                    <div class="row">
                        <h3 class="objective">{counter.count} OF {maxBeasts}</h3>
                    </div>
                </div>
            </div>
            <!-- <div class="bottom">
                <h3>{currentObjective?.category_name.toUpperCase()}</h3>
                <h2 class="objective">{currentObjective?.name.toUpperCase()}</h2>
                <p class="description">{currentObjective?.description.toUpperCase()}</p>
            </div> -->

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
        --bg-dark: #423c27f0;
        --bg-dark-full: #423c27;
        --bg: #564e30;
        --border: green;

        --text-effect: #FFE460;
        --text-faded: #FCC413d3;

        --text-dark: #ffffffab;
        --text: #F5FAFA;

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
        font-size: 1.66em;
        color: var(--text-dark);
        letter-spacing: 1px !important;
    }

    p {
        width: 80%;
        font-size: 1.33em;
        color: var(--text);
        display: -webkit-box;
        -webkit-line-clamp: 2;
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
    }

    .row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
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
        animation: 0.8s fadeIn ease-in-out forwards;
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
