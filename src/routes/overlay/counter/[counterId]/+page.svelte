<script lang="ts">
    import { page } from "$app/state";
    import type { ApiResponse, DBCounter } from "$lib/types";
    import { onMount } from "svelte";

    async function fetchCounter(id: string): Promise<DBCounter> {
      const res: ApiResponse<DBCounter> = await (await fetch(`/api/counters/${id}`)).json();
      return res.data;
    }

    let counter: DBCounter | null = $state(null);

    let label: string = $state(page.url.searchParams.get("label") || "Counter:")
    let fontSize: number = $state(parseFloat(page.url.searchParams?.get("fontSize") || "4") || 4);
    let withOutline: boolean = $state((page.url.searchParams?.get("withOutline") || "true") === "true");
    let color: string = $state(page.url.searchParams.get("color") || "white")

    onMount(async () => {
      if(!page.url.searchParams.has("withOutline")) withOutline = true;

        counter = await fetchCounter(page.params.counterId || "deaths");
        if(counter) {
          if(!page.url.searchParams.has("label")) label = counter.label;
        }

        setInterval(async () => {
            counter = await fetchCounter(page.params.counterId || "deaths");
            if(counter) {
              if(!page.url.searchParams.has("label")) label = counter.label;
            }
        }, 3e2);
    });
</script>

<div
    class="container"
>
<h1 style:font-size={`${fontSize}em`} style:color={color}>{label}</h1>
<h1 style:font-size={`${fontSize}em`} style:color={color}>
    {(counter?.count || 0) === 67
        ? `67 :(`
        : counter?.count === 69
          ? "69 ;)"
          : (counter?.count || 0).toLocaleString()}
</h1>
</div>

{#if withOutline}
    <style>
        h1 {
            -webkit-text-stroke: 2.5px black;
        }
    </style>
{/if}

<style>
    /*Default font*/
    @import url("https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&family=Do+Hyeon&display=swap");

    @keyframes fadeIn {
        from {
            opacity: 0;
            display: none;
        }

        to {
            opacity: 1;
            display: flex;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            display: flex;
        }

        to {
            opacity: 0;
            display: none;
        }
    }

    .container {
        padding-left: 0.2em;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.5em;
    }

    h1 {
        /*letter-spacing: 0.1em;*/
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        text-shadow: 2px 2px 5px black;
    }
</style>
