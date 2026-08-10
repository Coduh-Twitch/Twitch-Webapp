<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { PUBLIC_CHATBOT_SOCKET_URL } from "$env/static/public";
    import { AppConfig } from "$lib/config";
    import type {
        ApiResponse,
        ChatPacket,
        DBAmazonProduct,
        DBAppConfig,
        DBLeaderboardMember,
        DBWordGame,
        Packet,
    } from "$lib/types";
    import { Column, Heading, LoginButton, Row } from "duckylib";
    import { onDestroy, onMount } from "svelte";

    function initSocket() {
        socket = new WebSocket(PUBLIC_CHATBOT_SOCKET_URL);

        socket.onopen = async () => {
            console.log(`Socket Connected`);
            if (socket)
                socket.send(
                    JSON.stringify({
                        id: 0,
                        command: "check",
                        data: {
                            id: navigator.userAgent.split(" ")[0],
                            agent: navigator.userAgent,
                        },
                    }),
                );
        };

        socket.onmessage = async (ev) => {
            try {
                let packet: Packet = JSON.parse(ev.data);

                if (
                    (packet.command === "check" ||
                        packet.command === "heartbeat") &&
                    !game
                ) {
                    socket?.send(
                        JSON.stringify({
                            id: 0,
                            command: "wordGameConnection",
                            data: { binId: AppConfig.word_list_bin_id },
                        }),
                    );
                }

                if (packet.command === "wordGameState" && !gameEnded) {
                    console.log("state received");
                    game = packet.data.game;
                    if (!showingResults) {
                        gameSecondsElapsed = Math.floor(
                            (Date.now() - (game as DBWordGame).started_at) /
                                1000,
                        );
                        console.log("SECONDS", gameSecondsElapsed);
                        updateGameClock();
                    }
                    console.log("STATE", packet.data.game);
                }

                if (packet.command === "wordGameEnded" && !gameEnded) {
                    gameEnded = true;
                    game = packet.data.game;
                    winnerWordGuesses = packet.data.winner_total_guesses || 0;
                    guessed = game?.guessed ? true : false;

                    guesser = game?.guesser_username || "";
                    await endGame(null);
                }
            } catch (e) {
                console.log(`Failed to parse packet`, ev.data);
            }
        };

        socket.onclose = async () => {
            socket = null;
            setTimeout(() => {
                if (!socket) initSocket();
            }, 1000);
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

    async function fetchTopPlayers(): Promise<DBLeaderboardMember[]> {
        const res: ApiResponse<DBLeaderboardMember[]> = await (
            await fetch(`/api/leaderboard/words?slice=3`)
        ).json();
        return res.data || [];
    }

    async function fetchGameStart(): Promise<DBAppConfig> {
        let res: ApiResponse<DBAppConfig> = await (
            await fetch(`/api/bot/words/startGame`, { method: "POST" })
        ).json();
        console.log("GS", res);
        console.log("GS", res.data);

        return res.data;
    }

    async function fetchGameEnd(): Promise<DBAppConfig> {
        let res: ApiResponse<DBAppConfig> = await (
            await fetch(`/api/bot/words/endGame`, { method: "POST" })
        ).json();
        console.log("GE", res.data);

        return res.data;
    }

    onMount(() => {
        console.log("AGENT", navigator.userAgent);
        fetchSpoofifyConfig().then((c) => {
            spoofifyConfig = c;
        });
        fetchGuessedWords().then((w) => {
            guessedWords = w;
        });
        // fetchTopPlayers().then((t) => {
        //     topUsers = t;
        //     showingResults = true;
        //     showingLeaderboard = true;
        // });

        if (!socket && navigator.userAgent.includes("OBS")) {
            initSocket();
        }

        setInterval(async () => {
            if (!socket && navigator.userAgent.includes("OBS")) {
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
            setTimeout(() => {
                if (!socket) initSocket();
            }, 1000);
            console.log(`Socket Connection Closed`);
            return;
        }
    });

    let showResultsSeconds = 10;
    let showLeaderboardSeconds = 10;

    function updateGameClock() {
        if (!guessed) {
            let gameSeconds = gameSecondsElapsed;
            let minutes = Math.floor(gameSecondsElapsed / 60);
            // gameSecondsElapsed += 1;
            if (gameSecondsElapsed === 60) {
                gameMinutes += 1;
                gameSecondsElapsed = 0;
            } else if (gameSecondsElapsed > 60) {
                gameMinutes = minutes;
                gameSecondsElapsed = gameSecondsElapsed - minutes * 60;
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

        topUsers = await fetchTopPlayers();

        setTimeout(async () => {
            showingLeaderboard = true;
            if (game?.guessed) {
                setTimeout(async () => {
                    await fetchGameEnd();
                    try {
                        if (socket) socket.close();
                        socket = null;
                        window.location.reload();
                    } catch (e) {
                        if (browser) window.location.replace("/");
                    }
                }, showLeaderboardSeconds * 1000);
            } else {
                await fetchGameEnd();
                try {
                    if (socket) socket.close();
                    socket = null;
                    window.location.reload();
                } catch (e) {
                    if (browser) window.location.replace("/");
                }
            }
        }, showResultsSeconds * 1000);
    }

    let spoofifyConfig: typeof defaultConfig = $state(defaultConfig);
    let socket: WebSocket | null = $state(null);
    let guessedWords: string[] = $state([]);

    let showingLeaderboard = $state(false);
    let showingResults = $state(false);
    let guessed: boolean = $state(false);
    let guesser: string = $state("");
    let winnerWordGuesses = $state(0);
    let gameSecondsElapsed = $state(0);
    let gameMinutes = $state(0);
    let gameTimerInterval: NodeJS.Timeout | null = $state(null);
    let revealWord = $state(false);
    let gameEnded = $state(false);
    let topUsers: DBLeaderboardMember[] = $state([]);

    let game: DBWordGame | null = $state(null);
</script>

<div
    class="container"
    style:background-color={spoofifyConfig.color_1.replace("d3", "b3")}
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
                {showingLeaderboard ? "Top Guessers" : "Guess the Word!"}
            </h1>
            {#if !game}
                <h3>
                    {navigator.userAgent.includes("OBS")
                        ? "Finding a Word..."
                        : "Overlay Running..."}
                </h3>
            {:else}
                {#if !showingResults}
                    <Row
                        widthPx="fit"
                        heightPx="fit"
                        alignItems="center"
                        justifyContent="center"
                        gapEm={2}
                    >
                        {#each { length: game.revealed_part.split("").length } as _, i}
                            <p>
                                {game?.revealed_part.charAt(i)}
                            </p>
                        {/each}
                        {#each { length: game.word.length - game.revealed_part.length } as _, i}
                            <p>_</p>
                        {/each}
                    </Row>
                    <h3>
                        {`${gameMinutes}:${gameSecondsElapsed >= 10 ? gameSecondsElapsed : `0${gameSecondsElapsed}`}`}
                    </h3>
                {:else}
                    {#if showingLeaderboard}
                        <div class="lb">
                            <div class="lb-list">
                                {#each topUsers as user, i}
                                    <div
                                        class="lb-user"
                                        data-place={i + 1}
                                        style:background-color="var(--place-{i +
                                            1})"
                                    >
                                        <Row
                                            widthPx="fill"
                                            heightPx="fit"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Row
                                                widthPx="fit"
                                                heightPx="fit"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                gapEm={1.66}
                                            >
                                                <div
                                                    class="place-marker"
                                                    data-place={i + 1}
                                                    style:background-color="var(--place-{i +
                                                        1})"
                                                >
                                                    <p>
                                                        {i + 1 === 1
                                                            ? "🏆"
                                                            : i + 1 === 2
                                                              ? "🥈"
                                                              : i + 1 === 3
                                                                ? "🥉"
                                                                : i + 1}
                                                    </p>
                                                </div>
                                                <!-- {/if} -->
                                                <p class="username">
                                                    {user.username}
                                                </p>
                                            </Row>
                                            <p class="guesses">
                                                x{user.word_guesses.toLocaleString()}
                                                🔥
                                            </p>
                                        </Row>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {:else}
                        {#if guesser === ""}
                            <h2
                                style:color="#c94f3a"
                                style:text-shadow={`0 2px 10px #561d13, 0 0 20px #561d13;`}
                            >
                                NOBODY GOT IT :(
                            </h2>
                            <h5>
                                The word was "{revealWord
                                    ? game.word
                                    : "______"}"
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
                                    ? game.word
                                    : "______"}" correctly!
                                <span style:text-transform="lowercase"
                                    >({#if gameMinutes > 0}{gameMinutes}m{/if}{gameSecondsElapsed}s{winnerWordGuesses >
                                    0
                                        ? ` - x${((winnerWordGuesses || 0) + (navigator.userAgent.includes("OBS") ? 0 : 0)).toLocaleString()} 🔥`
                                        : ""})</span
                                >
                            </h5>
                        {/if}
                    {/if}
                {/if}
            {/if}
        </Column>
    </Column>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");
    :root {
        --place-1: #b27b23d3;
        --place-2: #5e5c58d3;
        --place-3: #5b2e17d3;
    }
    .container {
        width: 100vw;
        height: 100vh;
        text-transform: uppercase;
        font-family: "Inter", sans-serif;
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
        font-weight: 900 !important;
        margin: 0;
        letter-spacing: 2px;
    }

    h3 {
        /*TIMER*/
        font-size: 3.5vw;
        letter-spacing: 2px;
    }

    h2 {
        /*RESULTS HEADER*/
        font-size: 3vw;
        letter-spacing: 2px;
    }

    h5 {
        /*RESULTS SUBHEADER*/
        font-size: 2.5vw;
        letter-spacing: 2px;
        word-break: keep-all;
        text-wrap: wrap;
        width: 70%;
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
        letter-spacing: 2px;
    }

    code {
        text-transform: none !important;
        width: 100%;
        height: fit-content;
    }

    .lb {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: fit-content !important;
    }

    .lb-list {
        display: flex;
        flex-direction: column;
        gap: 1em;
        width: 100%;
        align-items: flex-start;
        justify-content: flex-start;
        height: fit-content;
    }

    .lb-user {
        transition: 1s all;
        width: 100% !important;
        height: fit-content;
        animation: slideUp 1s ease-out forwards !important;
        animation-delay: 1s;
        align-self: flex-start;
        padding: 1em;
        border-radius: 3vw;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        gap: 1em;
    }

    .lb-user p {
        transition: all 1s;
        transform: translateY(0px);
        margin: 0;
        animation: none !important;
    }

    #lb-heading {
        margin: 0;
        margin-top: 1em;
    }

    img {
        height: 6vw;
    }
    p.username {
        font-weight: 800 !important;
        font-size: 3.5vw;
    }

    p.guesses {
        text-transform: none !important;
        font-size: 3.6vw;
    }

    .lb-user[data-place="1"] {
        background-color: var(--place-1);
    }
    .lb-user[data-place="2"] {
        background-color: var(--place-2);
    }
    .lb-user[data-place="3"] {
        background-color: var(--place-3);
    }

    .place-marker {
        height: 6vw;
        aspect-ratio: 1/1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.33em;
        border-radius: 100px;
        filter: brightness(1.5);
    }

    .place-marker p {
        font-weight: 900 !important;
        font-size: 3.5vw !important;
        filter: brightness(0.7) !important;
    }
</style>
