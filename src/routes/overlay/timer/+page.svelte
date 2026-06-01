<script lang="ts">
    import type { ApiResponse, DBTimer } from "$lib/types";
    import { onMount } from "svelte";
    import moment from "moment";
    import durationFormat from "moment-duration-format";
    import { Row, Symbol, Text } from "duckylib";

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

    async function fetchTimer(): Promise<DBTimer> {
        let res: ApiResponse<DBTimer> = await (
            await fetch(`/api/timer`)
        ).json();
        return res.data;
    }

    async function fetchSpoofifyConfig(): Promise<typeof defaultConfig> {
        let res: ApiResponse<any | null> = await (
            await fetch(`/api/spoofify/config`)
        ).json();
        return res.data || defaultConfig;
    }

    // let showTimeAnyway = $state(false);

    onMount(async () => {
        timer = await fetchTimer();
        formattedDuration = moment
            .duration(timer.seconds, "seconds")
            .format(
                `${timer.seconds >= 86400 ? "DD:" : ""}${timer.seconds >= 3600 ? "HH:" : ""}${timer.seconds >= 60 ? "mm:" : "[00:]"}ss`,
            );

        spoofifyConfig = await fetchSpoofifyConfig();

        setInterval(async () => {
            timer = await fetchTimer();
            formattedDuration = moment
                .duration(timer.seconds, "seconds")
                .format(
                    `${timer.seconds >= 86400 ? "DD:" : ""}${timer.seconds >= 3600 ? "HH:" : ""}${timer.seconds >= 60 ? "mm:" : "[00:]"}ss`,
                );

        spoofifyConfig = await fetchSpoofifyConfig();
        }, 5e2);

        // setInterval(() => {
        //     if(!timer.paused && showTimeAnyway) showTimeAnyway = false;
        //     if(timer.paused) showTimeAnyway = !showTimeAnyway;
        // },10e3)
    });

    let timer: DBTimer = $state({
        id: "",
        label: "",
        paused: true,
        seconds: 0,
        started_at: new Date(),
        visible: false,
    });
    let formattedDuration: string = $state("00:00");
    let spoofifyConfig: typeof defaultConfig = $state(defaultConfig);
    
</script>

{#if timer.label !== ""}
    <div class="timer dark {timer.visible ? 'visible' : 'hidden'}" style={`
        background-color: ${spoofifyConfig?.color_1}df;
        color: ${spoofifyConfig?.text_color || "white"};
        border-radius: ${spoofifyConfig.border_radius}px;
        border: ${spoofifyConfig.stroke_width / 2}px solid ${spoofifyConfig.stroke_color};
        word-break: break-all;
        

    `}>
        <Text inheritColor={true} sizeEm={1.33} weight="bolder" maxLines={1}>{timer.label}</Text>
        <div
            class="duration{timer.paused ? " pausing" : ""}"
            style="color: {timer.paused ? "var(--red)" : timer.seconds === 0
                ? spoofifyConfig?.text_color || "white"
                : timer.seconds > 30
                  ? '#37aac6'
                  : 'var(--yellow)'};"
        >
            <Row widthPx="fit" heightPx="fit" gapEm={0.33}>
            {#if timer.paused}
                <Symbol name="pause" inheritColor={true} sizePx={32} />
            {/if}
                <Text inheritColor={true} sizeEm={1.66} weight="boldest" classList={timer.paused ? ["red"] : []}>{formattedDuration}</Text
            >
            </Row>
        </div>
    </div>
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
        0%,50%,100% {
            opacity: 1;
        }
        25%,75% {
            opacity: 0;
        }
    }

    .timer {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        padding: 0.66em 3em 0.66em 1.66em;
        align-items: center;
        justify-content: space-between;
        gap: 2em;
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
