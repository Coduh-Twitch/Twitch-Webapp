<script lang="ts">
    import { browser } from "$app/environment";
    import CustomReward from "$lib/components/CustomReward.svelte";
    import type { ApiResponse, TwitchCustomReward } from "$lib/types";
    import { cosineDistance } from "drizzle-orm";
    import { PgLineABC } from "drizzle-orm/pg-core";
    import { text } from "drizzle-orm/sqlite-core";
    import {
        Button,
        Column,
        Heading,
        HorizontalRule,
        Row,
        Text,
    } from "duckylib";
    import { onMount } from "svelte";
    import ColorPicker from "svelte-awesome-color-picker";

    const truncate = (input: string, length: number = 5) =>
        input.length > length ? `${input.substring(0, length - 3)}...` : input;

    const getRandomColor = (): string => {
        var letters = "0123456789ABCDEF";
        var color = "#";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const fetchRewards = async (): Promise<TwitchCustomReward[]> => {
        let res: ApiResponse<TwitchCustomReward[]> = await (
            await fetch(`/api/soundalerts/rewards`)
        ).json();
        return res.data || [];
    };

    let fileUpload: HTMLInputElement;
    let audioFile: File | null = $state(null);
    let previewAudio: HTMLAudioElement;

    let rewardName = $state("Sound Alert: ");
    let rewardCost = $state(100);
    let rewardColor = $state(getRandomColor());
    let colorPickerOpen = $state(false);

    let uploading = $state(false);
    let creating = $state(false);

    let rewards: TwitchCustomReward[] = $state([]);

    onMount(async () => {
        rewards = await fetchRewards();
        // console.log(rewards);

        setInterval(async () => {
            rewards = await fetchRewards();
            // console.log(rewards);
        }, 10e3);
    });
</script>

<Column heightPx="fit" justifyContent="center" alignItems="flex-start">
    <Column textWrap>
        <Heading weight="bolder" size={4}>Sound Alert Rewards</Heading>
        <Row heightPx="fit">
            {#if !uploading}
                <Button
                    label="Create Sound Alert"
                    type="success"
                    size="large"
                    onclick={() => {
                        if (fileUpload && !uploading) {
                            fileUpload.click();
                            uploading = true;
                        }
                    }}
                />
            {/if}
            <input
                style:display="none"
                type="file"
                name="upload"
                id="upload"
                bind:this={fileUpload}
                accept="audio/mpeg, audio/flac"
                oninput={async (e) => {
                    console.log("FILES", e.currentTarget.files);
                    let files = [];
                    if (!e.currentTarget.files) return (uploading = false);
                    for (const file of e.currentTarget.files) {
                        files.push(file);
                    }

                    if (!files[0]) return (uploading = false);

                    audioFile = files[0];

                    if (previewAudio) {
                        let objectUrl = URL.createObjectURL(audioFile);
                        console.log(objectUrl);
                        previewAudio.src = objectUrl;
                        previewAudio.addEventListener("loadedmetadata", (e) => {
                            previewAudio.volume = 0.25;
                            let target = e.target as HTMLAudioElement;
                            if (target.duration > 10) {
                                alert("Audio must be 10 seconds or less");
                                previewAudio.src = "";
                                audioFile = null;
                                uploading = false;
                            } else {
                                console.log("METADATA", target);
                                rewardName = `Sound Alert: ${truncate((audioFile as File).name.split(/[\|\-\[\]]/i)[0].trim(), 45)}`;
                            }
                        });
                    }
                }}
            />
            {#if uploading}
                {#if !audioFile}
                    <Text classList={["yellow"]}>Please upload a file</Text>
                {:else}
                    <Text maxLines={1} classList={["green"]}
                        >Selected File: {audioFile.name}</Text
                    >
                {/if}
                <audio
                    controls
                    bind:this={previewAudio}
                    style:display={audioFile ? "block" : "none"}
                ></audio>
            {/if}
        </Row>
        <HorizontalRule widthPercent={80} />
        {#if !uploading}
            {#if rewards.length > 0}
                <Row flexWrap>
                    {#each rewards as reward}
                        <CustomReward {reward} />
                    {/each}
                </Row>
            {:else}
                <Text sizeEm={1.33} weight="semibold" classList={["red"]}
                    >No Rewards Found</Text
                >
            {/if}
        {:else}
            <Column
                heightPx="fit"
                justifyContent="flex-start"
                alignItems="center"
            >
                <Column
                    heightPx="fit"
                    widthPx="fit"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    gapEm={0.66}
                >
                    <Text sizeEm={1} weight="bold">Reward Name</Text>
                    <input
                        disabled={!audioFile}
                        type="text"
                        bind:value={
                            () => rewardName,
                            (v) => {
                                if (
                                    !v.startsWith("Sound Alert: ") &&
                                    !rewardName.startsWith("Sound Alert: ")
                                ) {
                                    rewardName = `Sound Alert: ${v.trim()}`;
                                } else {
                                    rewardName = v.trimStart();
                                }
                            }
                        }
                        maxlength={45}
                        minlength={1}
                        required
                    />
                </Column>
                {#if uploading && rewardName !== "" && rewardName.trim() !== "Sound Alert:"}
                    <Column
                        heightPx="fit"
                        widthPx="fit"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        gapEm={0.66}
                    >
                        <Text sizeEm={1} weight="bold">Reward Cost</Text>
                        <input
                            disabled={!audioFile}
                            type="number"
                            bind:value={
                                () => rewardCost,
                                (v) => {
                                    rewardCost = Math.floor(v);
                                }
                            }
                            min={1}
                            required
                        />
                    </Column>

                    {#if rewardCost > 0}
                        <Column
                            heightPx="fit"
                            widthPx="fit"
                            justifyContent="flex-start"
                            alignItems="flex-start"
                            gapEm={0.66}
                        >
                            <Text sizeEm={1} weight="bold">Reward Color</Text>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div
                                class="dark colorpicker"
                                style:border="3px solid {rewardColor}"
                                onclick={() => {
                                    if (!colorPickerOpen)
                                        colorPickerOpen = true;
                                }}
                            >
                                <ColorPicker
                                    isOpen={colorPickerOpen}
                                    isAlpha={false}
                                    isDark={true}
                                    isTextInput={true}
                                    textInputModes={["hex"]}
                                    label={rewardColor === ""
                                        ? "Select Reward Color"
                                        : rewardColor}
                                    name="co"
                                    bind:hex={
                                        () => rewardColor,
                                        (v) => {
                                            rewardColor = v;
                                        }
                                    }
                                />
                            </div>
                        </Column>

                        <Button
                            label="Create Reward"
                            type="success"
                            size="large"
                            onclick={async () => {
                                if (!creating && audioFile) {
                                    creating = true;
                                    const form = new FormData();
                                    form.append("file", audioFile);
                                    let res: ApiResponse<{
                                        url: string;
                                    } | null> = await (
                                        await fetch(`/api/soundalerts/upload`, {
                                            method: "POST",
                                            body: form,
                                        })
                                    ).json();

                                    if (!res.data) {
                                        alert(
                                            `Failed to upload file:\n\n${res?.error ? res.error : "No error message."}`,
                                        );
                                        creating = false;
                                        return;
                                    }

                                    const createRes: ApiResponse<any | null> =
                                        await (
                                            await fetch(
                                                `/api/soundalerts/create`,
                                                {
                                                    method: "POST",
                                                    body: JSON.stringify({
                                                        url: res.data.url,
                                                        name: rewardName,
                                                        cost: rewardCost,
                                                        color: rewardColor,
                                                    }),
                                                },
                                            )
                                        ).json();

                                    if (!createRes.data?.data) {
                                        alert(
                                            `Failed to create custom reward:\n\n${createRes?.error ? createRes.error.message : "No error message."}`,
                                        );
                                        creating = false;
                                        return;
                                    }

                                    alert(
                                        `Created Reward ${createRes.data.data.name} for ${rewardCost} point${rewardCost === 1 ? "" : "s"}!`,
                                    );
                                    audioFile = null;
                                    uploading = false;
                                    creating = false;
                                    if (browser) window.location.reload();

                                    console.log(res.data);
                                }
                            }}
                        />
                    {/if}
                {/if}
            </Column>
        {/if}
    </Column>
</Column>

<style>
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
    }

    input[type="text"],
    input[type="number"] {
        -webkit-appearance: textfield;
        -moz-appearance: textfield;
        appearance: textfield;
        border: 3px solid var(--surface-0);
        background-color: var(--crust);
        color: var(--text);
        padding: 0.33em 0.66em;
        font-size: 1em;
        outline: none;
        border-radius: var(--border-md);
        min-width: 300px;
    }

    input[type="text"]:disabled {
        cursor: not-allowed;
    }

    .colorpicker {
        --cp-bg-color: var(--crust);
        --cp-border-color: var(--mantle);
        --cp-text-color: var(--text);
        --cp-input-color: var(--mantle);
        --cp-button-hover-color: var(--surface-2);
        --focus-color: var(--accent);

        --picker-indicator-size: 1em;
        --input-size: 1.33em;
        --slider-width: 0.66em;
        --picker-width: 200px;
        --picker-height: 125px;

        background-color: var(--crust);
        padding: 0.33em 0.66em;
        border-radius: var(--border-md);
        min-width: 300px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        cursor: pointer;
    }
</style>
