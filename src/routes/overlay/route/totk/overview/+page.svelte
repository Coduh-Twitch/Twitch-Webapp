<script lang="ts">
    import { browser } from "$app/environment";
    import { PUBLIC_TWITCH_CHANNEL_ID } from "$env/static/public";
    import questIcon from "$lib/assets/totk_quest.png";
    import triforceIcon from "$lib/assets/totk_quest_noshadow.png";
    import korokIcon from "$lib/assets/korok_icon.png"
    import shrineIcon from "$lib/assets/totk_shrine.png"
    import deathsIcon from "$lib/assets/deaths_icon.png"

    import temple_fire_complete from "$lib/assets/temple_fire_complete.png";
    import temple_fire_incomplete from "$lib/assets/temple_fire_incomplete.png";

    import temple_wind_complete from "$lib/assets/temple_wind_complete.png";
    import temple_wind_incomplete from "$lib/assets/temple_wind_incomplete.png";

    import temple_water_complete from "$lib/assets/temple_water_complete.png";
    import temple_water_incomplete from "$lib/assets/temple_water_incomplete.png";

    import temple_lightning_complete from "$lib/assets/temple_lightning_complete.png";
    import temple_lightning_incomplete from "$lib/assets/temple_lightning_incomplete.png";

    import { AppConfig } from "$lib/config";
    import type { ApiResponse, DBCompletableObjective, DBCounter, DBObjective, DBRoute, DBRouteProgress } from "$lib/types";
    import { onMount } from "svelte";

    import pattern from "$lib/assets/totk_pattern.png"

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
      const res: ApiResponse<DBRoute | null> = await (await fetch(`/api/route/totk`)).json();
      return res.data || null;
    }

    async function fetchProgress(): Promise<DBRouteProgress | null> {
      const res: ApiResponse<DBRouteProgress | null> = await (await fetch(`/api/route/totk/progress/${PUBLIC_TWITCH_CHANNEL_ID}`)).json();
      return res.data || null;
    }

    async function fetchCompleted(): Promise<DBCompletableObjective[]> {
      const res: ApiResponse<DBCompletableObjective[] | null> = await (await fetch(`/api/route/totk/progress/${PUBLIC_TWITCH_CHANNEL_ID}/objectives/completed`)).json();
      return res.data || [];
    }

    let currentCategory: string = $state("great-plateau");
    let currentObjective: DBObjective | null = $state(null);
    let nextObjective: DBObjective | null = $state(null);

    let featuredObjectives: string[] = $state([]);

    let lastCompleted: DBObjective | null = $state(null);
    let showingCompleted = $state(false);

    async function fetchCounter(id: string): Promise<DBCounter> {
        const res: ApiResponse<DBCounter> = await (
            await fetch(`/api/counters/${id}`)
        ).json();
        return res.data;
    }

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

      if(!showingCompleted && lastCompleted) {
        showingCompleted = true;
        setTimeout(() => {
          lastCompleted = null;
          setTimeout(() => {
            showingCompleted = false;
          },5e2)
        },10e3);
      }
    }

    let deathCounter: DBCounter | null = $state(null);
    let korokCounter: DBCounter | null = $state(null);
    let orbCounter: DBCounter | null = $state(null);
    let beastCounter: DBCounter | null = $state(null);

    let fireTempleCounter: DBCounter | null = $state(null);
    let waterTempleCounter: DBCounter | null = $state(null);
    let windTempleCounter: DBCounter | null = $state(null);
    let lightningTempleCounter: DBCounter | null = $state(null);

    onMount(async () => {
      if(browser) featuredObjectives = JSON.parse(window.localStorage.getItem("featured_objectives") || "[]");
      route = await fetchRoute();
      progress = await fetchProgress();
      completed = await fetchCompleted();
      deathCounter = await fetchCounter("deaths");
      korokCounter = await fetchCounter("korok-totk");
      orbCounter = await fetchCounter("spirit-orbs-totk");
      beastCounter = await fetchCounter("divine-beasts-totk");

      fireTempleCounter = await fetchCounter("temple-totk-fire");
      waterTempleCounter = await fetchCounter("temple-totk-water");
      windTempleCounter = await fetchCounter("temple-totk-wind");
      lightningTempleCounter = await fetchCounter("temple-totk-lightning");
      setMostRecents();

      setInterval(async () => {
        route = await fetchRoute();
        progress = await fetchProgress();
        completed = await fetchCompleted();
        deathCounter = await fetchCounter("deaths");
        korokCounter = await fetchCounter("korok-totk");
        orbCounter = await fetchCounter("spirit-orbs-totk");
        beastCounter = await fetchCounter("divine-beasts-totk");

        fireTempleCounter = await fetchCounter("temple-totk-fire");
        waterTempleCounter = await fetchCounter("temple-totk-water");
        windTempleCounter = await fetchCounter("temple-totk-wind");
        lightningTempleCounter = await fetchCounter("temple-totk-lightning");
        setMostRecents();
      },1e3)
    })
</script>

    <div class="container">
{#if route && progress}
            <div class="top">
                <div class="row">
                    <div class="row" style:gap="1em">
                        <img id="icon" src={questIcon} alt="">
                        <h1>TEARS OF THE KINGDOM</h1>
                    </div>
                </div>
                <div class="list">
                    <div class="stat">
                        <div class="statistic">
                            <img src={triforceIcon} alt="totk quest icon" class="icon">
                            <p class="value">{progress.progressPercentage}%</p>
                        </div>
                        <p>MAIN QUEST COMPLETION</p>
                    </div>

                    <div class="stat">
                        <div class="statistic">
                            <img src={shrineIcon} alt="shrine icon" class="icon">
                            <p class="value">{orbCounter?.count.toLocaleString()}</p>
                        </div>
                        <p>SHRINES COMPLETED</p>
                    </div>

                    <div class="stat">
                        <div class="statistic">
                            <img src={korokIcon} alt="korok seed icon" class="icon">
                            <p class="value">{korokCounter?.count.toLocaleString()}</p>
                        </div>
                        <p>KOROK SEEDS FOUND</p>
                    </div>

                    <div class="stat">
                        <div class="statistic">
                            <img src={deathsIcon} alt="skull icon" class="icon">
                            <p class="value">{deathCounter?.count.toLocaleString()}</p>
                        </div>
                        <p>TOTAL DEATHS</p>
                    </div>

                    <div class="stat">
                        <div class="statistic">
                            <img style:height="1.5em" src={(waterTempleCounter?.count || 0) > 0 ? temple_water_complete : temple_water_incomplete} alt="water icon" class="icon">
                        </div>
                        <p>WATER TEMPLE ({(waterTempleCounter?.count || 0) > 0 ? "COMPLETE" : "INCOMPLETE"})</p>
                    </div>

                    <div class="stat">
                        <div class="statistic">
                            <img style:height="1.5em" src={(fireTempleCounter?.count || 0) > 0 ? temple_fire_complete : temple_fire_incomplete} alt="fire icon" class="icon">
                        </div>
                        <p>FIRE TEMPLE ({(fireTempleCounter?.count || 0) > 0 ? "COMPLETE" : "INCOMPLETE"})</p>
                    </div>

                    <div class="stat">
                        <div class="statistic">
                            <img style:height="1.5em" src={(windTempleCounter?.count || 0) > 0 ? temple_wind_complete : temple_wind_incomplete} alt="wind icon" class="icon">
                        </div>
                        <p>WIND TEMPLE ({(windTempleCounter?.count || 0) > 0 ? "COMPLETE" : "INCOMPLETE"})</p>
                    </div>

                    <div class="stat">
                        <div class="statistic">
                            <img style:height="1.5em" src={(lightningTempleCounter?.count || 0) > 0 ? temple_lightning_complete : temple_lightning_incomplete} alt="lightning icon" class="icon">
                        </div>
                        <p>LIGHTNING TEMPLE ({(lightningTempleCounter?.count || 0) > 0 ? "COMPLETE" : "INCOMPLETE"})</p>
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

    .icon {
        height: 2em;
        aspect-ratio: 1/1;
    }

    :root {
        --bg-dark: #26433D;
        --bg-dark-full: #1d332e;
        --bg: #26433D;
        --border: green;

        --text-effect: #FFFDE3;
        --text-faded: #30544C;

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
        width: 100%;
        font-size: 1.33em;
        color: var(--text);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        letter-spacing: 0.1em;
    }

    p:not(.value) {
        font-size: 1.15em;
    }

    .value {
        font-size: 1.5em;
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
        min-width: 400px;
        background-color: var(--bg);
        display: flex;
        flex-direction: column;
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
        padding: 0em 1em 0.66em 1em;
    }

    .row,.stat,.statistic {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
    }

    .stat {
        justify-content: space-between;
        width: 100%;
        text-align: right;
        padding: 0.15em 1em;
        box-sizing: border-box;
    }

    .statistic {
        gap: 0.8em;
    }

    .list {
        width: 95%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 0.5em;
    }

    .stat:nth-child(odd) {
        background-color: #1b262480;
        border-radius: var(--border-md);
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
