<script lang="ts">
    import { page } from "$app/state";
    import {
        EspnSeason,
        type ApiResponse,
        type EspnResponse,
    } from "$lib/types";
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { derived } from "svelte/store";
    import { fade } from "svelte/transition";

    async function fetchScores(): Promise<EspnResponse | null> {
        const res: ApiResponse<EspnResponse> = await (
            await fetch(`/api/score`)
        ).json();
        return res.data || null;
    }

    const periods: Record<string, number> = {
        [EspnSeason.BASEBALL]: 9,
        [EspnSeason.BASKETBALL]: 4,
        [EspnSeason.FOOTBALL]: 4,
        [EspnSeason.SOCCER]: 2,
        [EspnSeason.HOCKEY]: 3,
    };

    const periodTerms: Record<string, string> = {
        [EspnSeason.BASEBALL]: "Inning",
        [EspnSeason.BASKETBALL]: "Quarter",
        [EspnSeason.FOOTBALL]: "Quarter",
        [EspnSeason.SOCCER]: "Half",
        [EspnSeason.HOCKEY]: "Period",
    };

    const overtimeTerms: Record<string, string> = {
        [EspnSeason.BASKETBALL]: "Overtime",
        [EspnSeason.FOOTBALL]: "Overtime",
        [EspnSeason.HOCKEY]: "Overtime",
    };

    const pointTerms: Record<string, string> = {
        [EspnSeason.BASEBALL]: "Score!",
        [EspnSeason.SOCCER]: "Goal!",
        [EspnSeason.BASKETBALL]: "Point!",
        [EspnSeason.FOOTBALL]: "Point!",
        [EspnSeason.HOCKEY]: "Goal!",
    };

    function getPointTerm(points: number) {
      if(!score) return pointTerms[EspnSeason.BASEBALL];
      if(score.season !== EspnSeason.FOOTBALL) return pointTerms[score.season as string];
      if(points === 6) return "Touchdown!";
      if(points === 3) return "Field Goal!";

      return pointTerms[score.season as string];
    }

    function setScore(s: EspnResponse | null) {
        score = s;
        if (score) {
            if (
                score?.season === EspnSeason.BASKETBALL ||
                score?.season === EspnSeason.FOOTBALL
            ) {
                timeTerm = "Remaining";
            } else timeTerm = "Elapsed";

            maxPeriods = periods[score.season as string];
            periodTerm = periodTerms[score.season as string];

            if(homeScoreSave !== score.homeScore && !firstLoad) {

              if(score.homeScore > homeScoreSave && !showOverlay) {
                let diff = score.homeScore - homeScoreSave;
                displayOverlay("home", getPointTerm(diff), `${score.homeTeam} +${diff.toLocaleString()}`)
              }
            } else if(awayScoreSave !== score.awayScore && !firstLoad) {
              if(score.awayScore > awayScoreSave && !showOverlay) {
                let diff = score.awayScore - awayScoreSave;
                displayOverlay("away", getPointTerm(diff), `${score.awayTeam} +${diff.toLocaleString()}`)
              }
            }

            homeScoreSave = score.homeScore;
            awayScoreSave = score.awayScore;
        }
    }

    onMount(async () => {
        setScore(hidden ? null : await fetchScores());

        setInterval(async () => {
            setScore(hidden ? null : await fetchScores());
            if(firstLoad) firstLoad = false;
        }, 1e3);

        setInterval(() => {
          console.log("FROM", displayMode)
          if(displayMode === "clock") {
            displayMode = "period";
          } else if(displayMode === "period") {displayMode = "clock";}
          console.log("TO", displayMode)
        },10e3);
    });

    function displayOverlay(bias: "home" | "away" | "none", heading: string, text: string): void {
      showOverlay = true;
      setTimeout(() => overlayBias = bias, 800);
      setTimeout(() => {
        overlayHeading = heading;
        overlayText = text;
        showOverlayText = true;
      }, 1000);


      setTimeout(() => {
        showOverlayText = false;
        setTimeout(() => {
          overlayBias = "none";
          setTimeout(() => {
          showOverlay = false;
          }, 500);
        }, 100);
      },6e3);
    }


    let score: EspnResponse | null = $state(null);

    let timeTerm: string = $state("Remaining");
    let maxPeriods: number = $state(0);
    let periodTerm: string = $state("Quarter");

    let hidden: boolean = $state(page.url.searchParams.get("hidden") === "true");
    let showOverlay: boolean = $state(page.url.searchParams.get("dev") === "true");
    let overlayBias: "home" | "away" | "none" = $state('none');
    let showOverlayText: boolean = $state(false);
    let overlayHeading: string = $state("heading");
    let overlayText: string = $state("Lorem ipsum dolor sit amet consectetur, adipisicing elit.");

    let homeScoreSave: number = $state(0);
    let awayScoreSave: number = $state(0);

    let firstLoad = $state(true);

    let displayMode: "clock" | "period" = $state("period");

</script>


<div class="overlay {showOverlay ? "in" : "out"}">
    <div class="home" style={`--home-color: ${`#${score?.homeColor}` || "var(--bg)"}`} style:width={overlayBias === "home" ? "100%" : "30%"}>
        <!-- svelte-ignore a11y_missing_attribute -->
        <img src={score?.homeLogo} class="icon" id="home-icon" style:scale={showOverlayText && overlayBias === "home" ? 1.1 : 0.95} />
        {#if overlayBias === "home" && showOverlay}
            <div class="overlaySection {showOverlayText ? "in" : "hide"}">
                <h1 class="heading">{overlayHeading}</h1>
                <p class="text">{overlayText}</p>
            </div>
        {/if}
    </div>
    {#if overlayBias === "none" && showOverlay}
        <div class="overlaySection {showOverlayText ? "in" : "hide"}">
            <h1 class="heading" style:text-align="center">{overlayHeading}</h1>
            <p class="text" style:text-align="center">{overlayText}</p>
        </div>
    {/if}
    <div class="away" style={`--away-color: ${`#${score?.awayColor}` || "var(--bg)"}`} style:width={overlayBias === "away" ? "100%" : "30%"}>
        {#if overlayBias === "away" && showOverlay}
            <div class="overlaySection {showOverlayText ? "in" : "hide"}">
                <h1 class="heading">{overlayHeading}</h1>
                <p class="text">{overlayText}</p>
            </div>
        {/if}
        <!-- svelte-ignore a11y_missing_attribute -->
        <img src={score?.awayLogo} class="icon" id="away-icon" style:scale={showOverlayText && overlayBias === "away" ? 1.1 : 0.95} />
    </div>
</div>
<div class="container {score ? 'in' : 'out'}">
    <div
        class="home"
        style={`--home-color: ${`#${score?.homeColor}` || "var(--bg)"}`}
    >
        <!-- svelte-ignore a11y_missing_attribute -->
        <img src={score?.homeLogo} class="icon" id="home-icon" />
        <!-- <h1 class="heading" id="home-name">{@html score?.homeTeam.replace(" ", "<br>")}</h1> -->
        <h1 class="score">{score?.homeScore}</h1>
    </div>

    <div class="middle">
        <p class="heading"
            id="vs"
        >{score?.homeTeam} vs {score?.awayTeam}</p>
        {#if displayMode === "clock" && score?.season !== EspnSeason.BASEBALL}
            {@const content = "GAME NOT STARTED"}
                {#if score?.period === 0}
                    <h1 class="period" transition:fade>{content}</h1>
                    {:else}
                    {@const content = `${score?.timeFormatted || "00:00"} ${timeTerm}`}
                    <h1 class="period" transition:fade>{content}</h1>
                {/if}
            {:else}
            {#if score?.period === 0}
                {@const content = "PREGAME"}
                <h1 class="period" transition:fade>{content}</h1>
                {:else if ((score?.period || 1) > maxPeriods) && (score?.season !== EspnSeason.BASEBALL && score?.season !== EspnSeason.SOCCER)}
                    <h1 class="period" transition:fade>{overtimeTerms[score?.season as string]}</h1>
                {:else}
                <h1 class="period" transition:fade>{score?.periodFormatted} {periodTerm} ⋅ !score</h1>
            {/if}
        {/if}
    </div>

    <div
        class="away"
        style={`--away-color: ${`#${score?.awayColor}` || "var(--bg)"}`}
    >
        <!-- <h1 class="heading" id="away-name">{@html score?.awayTeam.replace(" ", "<br>")}</h1> -->
        <h1 class="score">{score?.awayScore}</h1>
        <!-- svelte-ignore a11y_missing_attribute -->
        <img src={score?.awayLogo} class="icon" id="away-icon" />
    </div>
</div>

<!-- <input type="text" name="heading" id="heading" bind:value={overlayHeading}>
<input type="text" name="text" id="text" bind:value={overlayText}>
<button onclick={() => {
  displayOverlay("home", `Score!`, `${score?.homeTeam} scored!`)
}}>{showOverlay ? "hide" : "show"} overlay</button>
<select name="bias" id="bias" bind:value={overlayBias}>
    <option value="home">home</option>
    <option value="away">away</option>
    <option value="none">none</option>
</select>
<button onclick={() => {if(score) score.homeScore = (score?.homeScore || 0) + 1}}>add home score</button> -->

<style>
    @import url("https://fonts.googleapis.com/css2?family=Alumni+Sans:ital,wght@0,100..900;1,100..900&display=swap");

    :root {
        --bg: #0f0f0f;

        --home-color: var(--bg);
        --away-color: var(--bg);

        --width: 100%;
        --height: 100px;

        --font-xl: 6em;
        --font-lg: 2.1em;
        --font-md: 1.88em;
        --font-sm: 1.66em;
        --font-xs: 1.33em;
    }

    .middle {
        height: var(--height);
        width: 40%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        z-index: 100;
    }

    .overlay .heading {
        font-weight: 800;

        display: -webkit-box;
        line-clamp: 1;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .overlay .text {
        font-size: var(--font-sm);
        font-weight: 600;

        display: -webkit-box;
        line-clamp: 1;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .heading {
        transition: all 0.3s;
        display: -webkit-box;
        line-clamp: 1;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-weight: 600;
        filter: brightness(1.5);
    }


    p {
        font-size: var(--font-xs);
    }

    .time {
        font-size: var(--font-md);
        opacity: 0.5;
    }

    .period {
        font-size: var(--font-lg);
    }

    .score {
        font-size: var(--font-xl);

        font-weight: 900;
    }

    .home .score {
        text-align: left;
        text-shadow: 0px 0px 50px var(--home-color);
    }

    .away .score {
        text-align: right;
        text-shadow: 0px 0px 50px var(--away-color);
    }

    .overlay {
        position: absolute;
        z-index: 100;
    }

    .container,.overlay {
        background-color: var(--bg);
        color: white;
        width: var(--width);
        height: var(--height);

        display: flex;
        flex-direction: row;

        align-items: center;
        justify-content: space-between;
        border-radius: 16px;
        gap: 1em;

        font-family: "Alumni Sans";
    }

    .icon {
        transition: all 0.3s;
        height: calc(var(--height) * 0.9);
    }

    .home,
    .away {
        transition: all 0.3s;
        width: 30%;
        height: var(--height);
        display: flex;
        align-items: center;
        border-radius: 16px;
        gap: 5em;
    }

    .home {
        padding-left: 2em;
        justify-content: flex-start;
        background-image: linear-gradient(
            to right,
            var(--home-color) -90%,
            var(--bg)
        );
        border: 5px solid var(--bg);
        box-sizing: border-box;
        border-right: none;
    }

    .away {
        padding-right: 2em;
        justify-content: flex-end;
        background-image: linear-gradient(
            to left,
            var(--away-color) -100%,
            var(--bg)
        );
        border: 5px solid var(--bg);
        box-sizing: border-box;
        border-left: none;
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

    .in {
        animation: 0.5s fadeIn ease-in-out forwards;
    }

    .out {
        animation: 0.7s fadeOut ease-in forwards;
    }

    .hide {
        opacity: 0;
        visibility: hidden;
    }

    @media only screen and (max-width: 900px) {
        #vs {
            display: none;
        }
    }
</style>
