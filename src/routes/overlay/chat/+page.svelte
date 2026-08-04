<script lang="ts">
    import {
        ChatPacketSource,
        type ApiResponse,
        type ChatPacket,
        type DBClip,
        type DBNotice,
        type DBTimer,
        type Packet,
        type SevenTVEmote,
        type TwitchGlobalBadge,
    } from "$lib/types";
    import { onDestroy, onMount } from "svelte";
    import moment from "moment";
    import durationFormat from "moment-duration-format";
    import { PUBLIC_CHATBOT_SOCKET_URL } from "$env/static/public";
    import { getUserData, Row, Text } from "duckylib";

    import badge_Tiktok from "$lib/assets/badges/tiktok.png";
    import badge_Twitch from "$lib/assets/badges/twitch.png";
    import badge_Discord from "$lib/assets/badges/discord.png";
    import { browser } from "$app/environment";

    durationFormat(moment);

    interface DisplayedMessage {
        content: string;
        author: string;
        color: string;
        badges: string[];
        show: boolean;
        id: string;
    }

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

    async function fetchSpoofifyConfig(): Promise<typeof defaultConfig> {
        let res: ApiResponse<any | null> = await (
            await fetch(`/api/spoofify/config`)
        ).json();
        return res.data || defaultConfig;
    }

    async function getBadgeUrl(
        setId: string,
        badgeId: string,
    ): Promise<string> {
        let fallbackImagePath = "src/lib/assets/favicon.png";
        let toReturn: string | null =
            (
                (await (
                    await fetch(
                        `/api/twitch/badges/channel/${user?.id}/${setId}/${badgeId}`,
                    )
                ).json()) as TwitchGlobalBadge
            )?.image_url_2x || null;

        console.log("BADGE", setId, badgeId);
        if (!toReturn) {
            toReturn =
                (
                    (await (
                        await fetch(
                            `/api/twitch/badges/global/${setId}/${badgeId}`,
                        )
                    ).json()) as TwitchGlobalBadge
                )?.image_url_2x || null;
        }

        if (!toReturn) {
            toReturn = fallbackImagePath;
        }

        return toReturn;
    }

    async function getSevenTvEmotes(): Promise<SevenTVEmote[]> {
        if (!user?.id) return [];
        let res = await (await fetch(`/api/twitch/7tv/${user.id}`)).json();
        return res || [];
    }

    async function buildMessage(
        message: ChatPacket | null,
        system: boolean = false,
        systemContent: string | null = null,
        systemId: string | null = null,
    ): Promise<DisplayedMessage | null> {
        // console.log("EMOTES", await getSevenTvEmotes())
        if (system && systemContent) {
            return {
                author: "System",
                color: "#7289da",
                badges: [],
                content: systemContent,
                id: systemId
                    ? systemId
                    : `${Math.floor(Math.random() * 3287482)}-system-${Math.floor(Math.random() * 3287482)}`,
                show: true,
            };
        }

        if (!message) return null;

        // let ignored = await isUserIgnored(message.userInfo.userId);
        // if (ignored) return null;
        // console.log("TWITCH EMOTES", message.emoteOffsets);
        let built: DisplayedMessage = {
            id: message.messageId
                ? message.messageId
                : `${Math.floor(Math.random() * 99999999).toString(16)}`,
            author: message.userInfo.display_name,
            color: message.userInfo.color || `#4400A9`,
            content: message.content,
            badges: [],
            show: true,
        };

        if (
            message.source !== ChatPacketSource.TWITCH &&
            !/^[a-zA-Z0-9].*|.*[a-zA-Z0-9]$/gim.test(
                message.userInfo.display_name,
            ) &&
            message.userInfo.display_name.length <= 3
        )
            built.author = `${message.userInfo.login} (${message.userInfo.display_name})`;

        let badges: Record<string, string> = message.userInfo.twitchData
            ? message.userInfo.twitchData.badgeInfo
            : {};

        let b: string[] = [];

        Object.entries(badges).forEach(async ([setId, badgeId]) => {
            let badge = await getBadgeUrl(setId, badgeId);
            console.log("BADGE", badge);
            b = [...b, badge];
            built.badges = [...built.badges, badge];
        });

        let p = Object.entries(badges).map(
            async ([setId, badgeId]) => await getBadgeUrl(setId, badgeId),
        );

        built.badges = await Promise.all(p);

        if (message.source === ChatPacketSource.DISCORD) {
            console.log(`SOURCE: DISCORD`);
            built.badges = [badge_Discord, ...built.badges];
        }
        if (message.source === ChatPacketSource.TIKTOK) {
            console.log(`SOURCE: TIKTOK`);
            built.badges = [badge_Tiktok, ...built.badges];
        }
        if (message.source === ChatPacketSource.TWITCH) {
            console.log(`SOURCE: TWITCH`);
            // built.badges = [badge_Twitch, ...built.badges];
        }

        console.log("MESSAGE ID", message.messageId);

        let sevenEmoteOffsets = findSevenTvEmotes(built.content);
        let emojisToReplace: { text: string; url: string }[] = [];
        console.log("7TV OFFSETS", sevenEmoteOffsets);
        Object.entries({
            ...sevenEmoteOffsets,
            ...message.emoteOffsets,
        }).forEach(([key, url]) => {
            let nums = key.split(/\-/g);
            let i = parseInt(nums[0]);
            let toReplace = "";
            while (i <= parseInt(nums[1])) {
                toReplace += message.content.charAt(i);
                i++;
            }

            emojisToReplace.push({ text: toReplace, url: url });
        });

        emojisToReplace.forEach((t) => {
            built.content = built.content.replaceAll(
                t.text,
                `\<img src=\'${t.url}\' alt=\"emote\" style="height:1.66em; line-height: 0.5em; margin-bottom: -5px;" class="emoji" \/\>`,
            );
        });

        let usernameRegex = new RegExp(
            user?.username || "---usernotfound",
            "gim",
        );

        built.content = built.content.replaceAll(
            usernameRegex,
            `<span style="background-color:rgba(128, 50, 128, 0.508);padding: 0px 3px;">${user?.username}</span`,
        );

        // emojisToReplace = [];

        // Object.entries(sevenEmoteOffsets).forEach(([key, url]) => {
        //     let nums = key.split(/\-/g);
        //     let i = parseInt(nums[0]);
        //     let toReplace = "";
        //     while (i <= parseInt(nums[1])) {
        //         toReplace += message.content.charAt(i);
        //         i++;
        //     }

        //     emojisToReplace.push({ text: toReplace, url: url });
        // });

        // emojisToReplace.forEach((t) => {
        //     built.content = built.content.replaceAll(
        //         t.text,
        //         `\<img src=\'${t.url}\' alt=\"emoticon\" style="height:1.33em; line-height: 0.5em; margin-bottom: -5px;" class="emoji" \/\>`,
        //     );
        // });

        return built;
    }

    function findSevenTvEmotes(content: string): Record<string, string> {
        let toReturn: Record<string, string> = {};
        let matches: { emote: string; index: number }[] = [];
        let workingContent = content;
        let i = 0;

        sevenEmotes.forEach((e) => {
            let key = e.name;

            let firstChar = key[0];
            let finalChar = key[key.length - 1];
            // console.log("SEVEN EMOTE KEY", key, firstChar, finalChar)

            let keyRegex = new RegExp(key, "g");
            content.matchAll(keyRegex).forEach((match) => {
                console.log("MATCH", key, match);
                if (match[0])
                    matches.push({
                        emote: match[0],
                        index: workingContent.indexOf(match[0]),
                    });
                workingContent = workingContent.replace(
                    match[0],
                    "-".repeat(match[0].length),
                );
            });
        });

        matches = matches.sort((a, b) => a.index - b.index);
        workingContent = content;

        matches.forEach((match) => {
            let startIndex = match.index;
            let endIndex = startIndex + match.emote.length - 1;

            let emote = sevenEmotes.find((e) => e.name === match.emote);

            if (emote)
                toReturn[`${startIndex}-${endIndex}`] =
                    `https:${emote.data.host.url}/${emote.data.host.files.find((f) => f.name === "1x.webp")?.name}`;
        });

        console.log(`EMOTE MATCHES`, matches);
        console.log("TO RETURN", toReturn);

        return toReturn;
    }

    function sendMessage(msg: DisplayedMessage): void {
        if (messages.length >= 20) messages.pop();
        messages.push(msg);
        if (browser)
            window.scrollTo({ top: window.outerHeight, behavior: "smooth" });
        setTimeout(() => {
            messages = messages.filter((m) => m.id !== msg.id);
        }, 15e3);
    }

    function initSocket() {
        socket = new WebSocket(PUBLIC_CHATBOT_SOCKET_URL);

        socket.onopen = async () => {
            console.log(`Socket Connected`);
            messages = [];
            let systemMsg = await buildMessage(
                null,
                true,
                "Connected!",
                `connected-msg`,
            );
            if (systemMsg) {
                sendMessage(systemMsg);
                setTimeout(() => {
                    messages = [];
                }, 2e3);
            }

            setTimeout(() => {
                if (browser && messages.length <= 0) {
                    window.location.reload();
                }
            }, 30e3);
        };

        socket.onmessage = async (ev) => {
            try {
                let packet: Packet = JSON.parse(ev.data);
                if (packet.command === "chat") {
                    if (firstMessage) {
                        firstMessage = false;
                        messages = [];
                    }

                    let messagePacket: ChatPacket = packet.data;
                    // if (messagePacket.source === ChatPacketSource.TWITCH) {
                    let builtMessage: DisplayedMessage | null =
                        await buildMessage(messagePacket);
                    if (builtMessage) {
                        sendMessage(builtMessage);
                    }
                    // }
                    // if (messagePacket.source === ChatPacketSource.TWITCH) {
                    //     console.log(
                    //         "message from twitch (badges)",
                    //         messagePacket.userInfo.twitchData?.badges,
                    //     );
                    // }
                } else if (packet.command === "chatclear") {
                    messages = [];
                    let systemMsg = await buildMessage(
                        null,
                        true,
                        "The chat was cleared by a Moderator.",
                        `chat-clear-msg`,
                    );
                    if (systemMsg) {
                        sendMessage(systemMsg);
                        firstMessage = true;
                    }
                } else if (packet.command === "deleteMessage") {
                    if (packet.data.id) {
                        console.log(`DELETE MESSAGE ${packet.data.id}`);
                        console.log(messages.length);
                        console.log(messages);
                        const msg = messages.find(
                            (m) => m.id === packet.data.id,
                        );
                        console.log(messages);
                        messages = messages.filter(
                            (m) => m.id !== packet.data.id,
                        );
                        console.log(messages.length);
                    }
                }
            } catch (e) {
                console.log(`Failed to parse packet`, ev.data);
            }
        };

        socket.onclose = async () => {
            socket = null;
            console.log(`Socket Connection Lost`);
        };
    }

    onMount(() => {
        // spoofifyConfig = await fetchSpoofifyConfig();
        getSevenTvEmotes().then((r) => {
            sevenEmotes = r;
        });
        initSocket();

        setInterval(async () => {
            if (!socket) {
                initSocket();
            }
            sevenEmotes = await getSevenTvEmotes();
        }, 5e3);

        return () => {
            if (socket) socket.close();
            socket = null;
            console.log(`Socket Connection Closed`);
        };
    });

    onDestroy(() => {
        if (socket) {
            socket.close();
            socket = null;
            console.log(`Socket Connection Closed`);
            return;
        }
    });

    // let spoofifyConfig: typeof defaultConfig = $state(defaultConfig);

    let socket: WebSocket | null = $state(null);
    let messages: DisplayedMessage[] = $state([]);
    let user = $state(getUserData());
    let sevenEmotes: SevenTVEmote[] = $state([]);
    let firstMessage = $state(true);
</script>

<div class="chat">
    {#each messages as message}
        <div class="message">
            <div class="author" style="color: {message.color};">
                <div class="badges">
                    {#each message.badges as badge}
                        <img src={badge} alt="" />
                    {/each}
                </div>
                <Row widthPx="fill" heightPx="fit" gapEm={0}>
                    <Text inheritColor={true} weight="bold" sizeEm={0.9}
                        >{message.author}</Text
                    >
                    <Text inheritColor={false}>:</Text>
                </Row>
            </div>
            <div class="content">
                <Text inheritColor={true} weight="semibold"
                    >{@html message.content}</Text
                >
            </div>
        </div>
    {/each}
</div>

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

    .chat {
        height: 100%;
        width: 100%;
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        flex-wrap: nowrap;
        gap: 0.5em;
    }

    .message {
        /* max-height: 75px; */
        min-height: fit-content;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        text-align: left;
        gap: 0.33em;
        word-break: break-word;
        overflow-wrap: break-word;
        /* flex-wrap: wrap; */
        /* text-wrap: wrap; */
        overflow: hidden;
        flex-shrink: 0;
        animation: 0.3s fadeIn linear forwards;
    }

    .badges img {
        height: 1em;
    }

    .badges {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.2em;
    }

    .content {
        --px: 0.7px;
        --px-neg: -0.3px;
        /*--shadow-clr: #4f4f4f;*/
        --shadow-clr: #000;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 0.33em;
        text-wrap: wrap;
        min-height: 100%;
        color: #fff;
        text-shadow:
            var(--px-neg) var(--px-neg) 0 var(--shadow-clr),
            var(--px) var(--px-neg) 0 var(--shadow-clr),
            var(--px-neg) var(--px) 0 var(--shadow-clr),
            var(--px) var(--px) 0 var(--shadow-clr);
    }

    .author {
        --px: 0.2px;
        --px-neg: -1px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.33em;
        text-shadow:
            var(--px-neg) var(--px-neg) 0 #4f4f4f,
            var(--px) var(--px-neg) 0 #4f4f4f,
            var(--px-neg) var(--px) 0 #4f4f4f,
            var(--px) var(--px) 0 #4f4f4f;
    }

    .content img {
        height: 1.4em;
    }
</style>
