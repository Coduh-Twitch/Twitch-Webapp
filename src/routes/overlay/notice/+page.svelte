<script lang="ts">
    import type { ApiResponse, DBNotice, DBTimer } from "$lib/types";
    import { onMount } from "svelte";
    import moment from "moment";
    import durationFormat from "moment-duration-format";
    import { Column, Row, Symbol, Text } from "duckylib";

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

    async function fetchNotice(): Promise<DBNotice> {
        let res: ApiResponse<DBNotice> = await (
            await fetch(`/api/notice`)
        ).json();
        return res.data;
    }

    async function fetchSpoofifyConfig(): Promise<typeof defaultConfig> {
        let res: ApiResponse<any | null> = await (
            await fetch(`/api/spoofify/config`)
        ).json();
        return res.data || defaultConfig;
    }

    let showTimeAnyway = $state(false);
    let expirationTimeout: NodeJS.Timeout | null = $state(null);

    onMount(async () => {
        notice = await fetchNotice();

        spoofifyConfig = await fetchSpoofifyConfig();

        setInterval(async () => {
            notice = await fetchNotice();

            spoofifyConfig = await fetchSpoofifyConfig();

            // if(notice.visible && !expirationTimeout) {
            //     expirationTimeout = setTimeout(() => {

            //     },30e3)
            // }
            // if(!notice.visible && expirationTimeout) {
            //     clearTimeout(expirationTimeout);
            //     expirationTimeout = null;
            // } 
        }, 1e3);
    });

    let notice: DBNotice = $state({
        id: "",
        label: "",
        visible: false,
    });
    let spoofifyConfig: typeof defaultConfig = $state(defaultConfig);
    
</script>

{#if notice.label !== ""}
    <div class="notice dark {notice.visible ? 'visible' : 'hidden'}" style={`
        background-color: ${spoofifyConfig?.color_1}df;
        color: ${spoofifyConfig?.text_color || "white"};
        border-radius: ${spoofifyConfig.border_radius}px;
        border: ${spoofifyConfig.stroke_width / 2}px solid ${spoofifyConfig.stroke_color};
        word-break: break-all;
        

    `}>
            <Symbol name="swords" inheritColor={true} sizePx={24} />
            
            <Column widthPx="fit" heightPx="fit" gapEm={0.1} alignItems="flex-start">
                <Text inheritColor={true} sizeEm={0.6} weight="semibold">Message from Mods</Text
            >
            <Text inheritColor={true} sizeEm={1} weight="bold" maxLines={1}>{notice.label}</Text>
            </Column>
        <!-- <div
            class="duration"
            style="color: {spoofifyConfig?.text_color || "white"};"
        >
            <Column widthPx="fit" heightPx="fit" gapEm={0.33}>
                <Text inheritColor={true} sizeEm={1.66} weight="boldest">{notice.label}</Text
            >
            </Column>
        </div> -->
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

    .notice {
        /* margin-left: auto;
        margin-right: auto;
        width: fit-content; */
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        padding: 0.66em 3em 0.66em 1.66em;
        align-items: center;
        justify-content: center;
        gap: 1em;
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
