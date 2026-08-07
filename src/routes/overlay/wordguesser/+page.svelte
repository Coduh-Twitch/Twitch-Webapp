<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { PUBLIC_CHATBOT_SOCKET_URL } from "$env/static/public";
    import { AppConfig } from "$lib/config";
    import type { ApiResponse, ChatPacket, Packet } from "$lib/types";
    import { Column, Heading, Row } from "duckylib";
    import { onDestroy, onMount } from "svelte";

    function initSocket() {
        socket = new WebSocket(PUBLIC_CHATBOT_SOCKET_URL);

        socket.onopen = async () => {
            console.log(`Socket Connected`);
        };

        socket.onmessage = async (ev) => {
            try {
                let packet: Packet = JSON.parse(ev.data);

                if (packet.command === "chat") {
                    let message = packet.data as ChatPacket;
                    console.log(`chat from ${message.source}`, message.content);
                    let word = message.content
                        .split(" ")[0]
                        .trim()
                        .toLowerCase();
                    console.log("GUESS", `${word}/${currentWord}`);
                    if (word === currentWord && !guessed) {
                        guessed = true;
                        guesser = message.userInfo.display_name;
                        await (
                            await fetch(
                                `/api/bot/users/${message.userInfo.userId}/addWordScore`,
                                {
                                    method: "POST",
                                    body: JSON.stringify({
                                        word: currentWord,
                                        revealed_word: revealedPart,
                                    }),
                                },
                            )
                        ).json();
                        guesserObject =
                            (
                                await (
                                    await fetch(
                                        `/api/bot/users/${message.userInfo.userId}`,
                                    )
                                ).json()
                            )?.data || null;

                        console.log("GUESSER", guesserObject);

                        endGame(null);
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

    async function fetchGuessedWords(): Promise<string[]> {
        let res: ApiResponse<string[]> = await (
            await fetch(`/api/config/words`)
        ).json();
        return res.data || [];
    }

    async function fetchRandomWord(): Promise<string> {
        const binId = AppConfig.word_list_bin_id;
        const str = await (await fetch(`/api/bot/pastebin/${binId}`)).text();
        const words = str
            .trim()
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter((w) => !guessedWords.includes(w));

        const random = Math.floor(Math.random() * words.length);
        const word = words[random] || words[random + 1] || words[0];

        return word;
    }

    onMount(() => {
        fetchSpoofifyConfig().then((c) => {
            spoofifyConfig = c;
        });
        fetchGuessedWords().then((w) => {
            guessedWords = w;
        });

        startGame().then((g) => {
            console.log(
                "Starting Game Loop...",
                page.url.searchParams.get("rl"),
            );
        });

        initSocket();

        setInterval(async () => {
            if (!socket) {
                initSocket();
            }
            spoofifyConfig = await fetchSpoofifyConfig();
            guessedWords = await fetchGuessedWords();
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

    let firstHintSeconds = 30;
    let subsequentHintSeconds = 20;
    let showResultsSeconds = 10;

    function addHint() {
        revealedPart += currentWord.slice(revealedPart.length).charAt(0);
        hiddenLetters -= 1;
    }

    function updateGameClock() {
        if (!guessed) {
            gameSecondsElapsed += 1;
            if (gameSecondsElapsed === 60) {
                gameMinutes += 1;
                gameSecondsElapsed = 0;
            }
        }
    }

    async function endGame(endInterval: NodeJS.Timeout | null) {
        if (gameTimerInterval) {
            clearInterval(gameTimerInterval);
            gameTimerInterval = null;
        }
        if (endInterval) clearInterval(endInterval);

        showingResults = true;
        revealWord = true;

        setTimeout(async () => {
            if (browser) window.location.reload();
        }, showResultsSeconds * 1000);
    }

    async function startGame() {
        hiddenLetters = 6;
        currentWord = "";
        revealedPart = "";
        guesser = "";
        guesserObject = null;
        guessed = false;
        showingResults = false;
        revealWord = false;
        gameSecondsElapsed = 0;
        gameMinutes = 0;
        gameTimerInterval = setInterval(() => {
            updateGameClock();
        }, 1000);

        let endInterval = setTimeout(async () => {
            await endGame(endInterval);
        }, gameLength * 1000);

        currentWord = await fetchRandomWord();
        for (var i = 0; i < startingHint; i++) {
            setTimeout(() => {
                addHint();
            }, 500 * i);
        }
        setTimeout(async () => {
            if (!guessed) {
                addHint();
                setInterval(async () => {
                    if (!guessed) {
                        if (revealedPart.length < currentWord.length - 1)
                            addHint();
                    } else await endGame(endInterval);
                }, subsequentHintSeconds * 1000);
            } else await endGame(endInterval);
        }, firstHintSeconds * 1000);
    }

    let spoofifyConfig: typeof defaultConfig = $state(defaultConfig);
    let socket: WebSocket | null = $state(null);
    let guessedWords: string[] = $state([]);

    let gameLength = 300;
    let startingHint = 2;
    let currentWord = $state("");
    let revealedPart = $state("");

    let hiddenLetters = $state(6);

    let showingResults = $state(false);
    let guessed: boolean = $state(false);
    let guesser: string = $state("");
    let guesserObject: any | null = $state(null);
    let gameSecondsElapsed = $state(0);
    let gameMinutes = $state(0);
    let gameTimerInterval: NodeJS.Timeout | null = $state(null);
    let revealWord = $state(false);
    let hintUpcoming = $state(false);
    let hintInSeconds = $state(0);
</script>

<div
    style:background-color={spoofifyConfig.color_1}
    style:color={spoofifyConfig.text_color}
>
    <Column
        widthPx="fill"
        heightPx="fill"
        alignItems="center"
        justifyContent="center"
    >
        <Column
            widthPx="fit"
            heightPx="fit"
            alignItems="center"
            justifyContent="center"
            gapEm={2}
        >
            <h1
                style:color={spoofifyConfig.stroke_color}
                style:text-shadow="0 2px 10px {spoofifyConfig.stroke_color}66, 0
                0 20px {spoofifyConfig.stroke_color}66;"
            >
                Guess the Word!
            </h1>
            {#if currentWord === "" || currentWord.startsWith("{")}
                <h3>Loading...</h3>
            {:else}
                {#if !showingResults}
                    <Row
                        widthPx="fit"
                        heightPx="fit"
                        alignItems="center"
                        justifyContent="center"
                        gapEm={2}
                    >
                        {#each { length: revealedPart.split("").length } as _, i}
                            <p>
                                {revealedPart.charAt(i)}
                            </p>
                        {/each}
                        {#each { length: hiddenLetters } as _, i}
                            <p>_</p>
                        {/each}
                    </Row>
                    <h3>
                        {`${gameMinutes}:${gameSecondsElapsed >= 10 ? gameSecondsElapsed : `0${gameSecondsElapsed}`}`}
                    </h3>
                {:else}
                    {#if !guessed}
                        <h2
                            style:color="#c94f3a"
                            style:text-shadow={`0 2px 10px #561d13, 0 0 20px #561d13;`}
                        >
                            NOBODY GOT IT :(
                        </h2>
                        <h5>
                            The word was "{revealWord ? currentWord : "______"}"
                        </h5>
                    {:else}
                        <h2
                            style:color="#63c94c"
                            style:text-shadow={`0 2px 10px #2c5613, 0 0 20px #2c5613;`}
                        >
                            CORRECT!
                        </h2>
                        <h5>
                            @{guesser} guessed "{revealWord
                                ? currentWord
                                : "______"}" correctly!
                            <span style:text-transform="lowercase"
                                >({#if gameMinutes > 0}{gameMinutes}m{/if}{gameSecondsElapsed}s{guesserObject
                                    ? ` - x${(guesserObject.word_guesses || 0).toLocaleString()} 🔥`
                                    : ""})</span
                            >
                        </h5>
                    {/if}
                {/if}
            {/if}
        </Column>
    </Column>
</div>

<style>
    div {
        width: 100vw;
        height: 100vh;
        text-transform: uppercase;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    #reveal {
        transition: all 3s;
    }

    #reveal::after {
        content: var(--revealed-content);
    }

    h1 {
        /*HEADING*/
        font-size: 5vw;
        font-weight: 900;
    }

    h3 {
        /*TIMER*/
        font-size: 3.5vw;
    }

    h2 {
        /*RESULTS HEADER*/
        font-size: 3vw;
    }

    h5 {
        /*RESULTS SUBHEADER*/
        font-size: 2.5vw;
        letter-spacing: 1px;
    }

    @keyframes slideUp {
        from {
            transform: translateY(-20px);
        }
        from {
            transform: translateY(0px);
        }
    }

    p {
        /*WORD*/
        transition: all 1s;
        animation-delay: 0;
        opacity: 1;
        transform: translateY(-10px);
        font-size: 4vw;
        font-weight: 700;
        animation: slideUp 1s ease-out forwards;
    }
</style>
