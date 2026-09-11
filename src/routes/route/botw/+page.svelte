<script lang="ts">
    import { PUBLIC_TWITCH_CHANNEL_ID } from "$env/static/public";
    import CounterItem from "$lib/components/CounterItem.svelte";
    import type { DBRoute, ApiResponse, DBRouteProgress, DBCompletableObjective, DBObjective, DBCounter } from "$lib/types";
    import { Button, Column, Heading } from "duckylib";
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

    async function fetchCounter(id: string): Promise<DBCounter> {
          const res: ApiResponse<DBCounter> = await (await fetch(`/api/counters/${id}`)).json();
          return res.data;
        }

    let currentCategory: string = $state("great-plateau");
    let currentObjective: DBObjective | null = $state(null);
    let nextObjective: DBObjective | null = $state(null);

    let deathCounter: DBCounter | null = $state(null);
    let korokCounter: DBCounter | null = $state(null);
    let orbCounter: DBCounter | null = $state(null);
    let beastCounter: DBCounter | null = $state(null);

    function setMostRecents() {
      let nonCompleted = (route?.objectives || []).filter(o => !completed.some(c => c.objective_id === o.objective_id)).sort((a, b) => (routeCategories.find(c => c.id === a.category_id)?.order || 0) - (routeCategories.find(c => c.id === b.category_id)?.order || 0));
      let recent = nonCompleted[0];
      let next = nonCompleted[1];

      currentCategory = recent.category_id;
      currentObjective = recent;
      nextObjective = next;
    }

    onMount(async () => {
      route = await fetchRoute();
      progress = await fetchProgress();
      completed = await fetchCompleted();
      deathCounter = await fetchCounter("deaths");
      korokCounter = await fetchCounter("korok");
      orbCounter = await fetchCounter("spirit-orbs");
      beastCounter = await fetchCounter("divine-beasts");
      setMostRecents();

      setInterval(async () => {
        route = await fetchRoute();
        progress = await fetchProgress();
        completed = await fetchCompleted();
        deathCounter = await fetchCounter("deaths");
        korokCounter = await fetchCounter("korok");
        orbCounter = await fetchCounter("spirit-orbs");
        beastCounter = await fetchCounter("divine-beasts");
        setMostRecents();
      },5e2)

    })

    let showAll = $state(false);
</script>

<Column gapEm={2} heightPx="fit" alignItems="flex-start">
{#if route && progress}
    {#if deathCounter}
        <CounterItem counter={deathCounter} />
    {/if}
    {#if korokCounter}
        <CounterItem counter={korokCounter} />
    {/if}
    {#if orbCounter}
        <CounterItem counter={orbCounter} />
    {/if}
    {#if beastCounter}
        <CounterItem counter={beastCounter} />
    {/if}
    <Heading weight="bold">{progress.progressPercentage}% Completed</Heading>
    <!-- <h5>Current: {currentObjective?.name} ({currentObjective?.category_id}/{currentObjective?.objective_id})</h5>
    {#if nextObjective}
        <h5>Next: {nextObjective.name} ({nextObjective.category_id}/{nextObjective.objective_id})</h5>
    {/if} -->

    {#if currentObjective !== null}
        <Column heightPx="fit" alignItems="flex-start">
            <Heading size={3}>Current Objective</Heading>
            <Button label={currentObjective.category_name + ": " + currentObjective.name} type={completed.some(c => c.objective_id === (currentObjective as DBObjective).objective_id) ? "success" : "danger"} onclick={async () => {
              let isCompleted = completed.some(c => c.objective_id === (currentObjective as DBObjective).objective_id);
              console.log(isCompleted);
              if(isCompleted) {
                await unCompleteObjective((currentObjective as DBObjective).objective_id);
              } else await completeObjective((currentObjective as DBObjective).objective_id);
            }} />
        </Column>
    {/if}

    {#if nextObjective !== null}
        <Column heightPx="fit" alignItems="flex-start">
            <Heading size={3}>Next Objective</Heading>
            <Button label={nextObjective.category_name + ": " + nextObjective.name} type={completed.some(c => c.objective_id === (nextObjective as DBObjective).objective_id) ? "success" : "danger"} onclick={async () => {
              let isCompleted = completed.some(c => c.objective_id === (nextObjective as DBObjective).objective_id);
              console.log(isCompleted);
              if(isCompleted) {
                await unCompleteObjective((nextObjective as DBObjective).objective_id);
              } else await completeObjective((nextObjective as DBObjective).objective_id);
            }} />
        </Column>
    {/if}

    <Button label="{showAll ? "Hide" : "Show"} all objectives" type={showAll ? "danger" : "success"} onclick={() => showAll = !showAll} />
    {#if showAll}
        <Column heightPx="fit" alignItems="flex-start">
            {#each route.objectives as objective}
                <Button label={objective.category_name + ": " + objective.name} type={completed.some(c => c.objective_id === objective.objective_id) ? "success" : "danger"} onclick={async () => {
                  let isCompleted = completed.some(c => c.objective_id === objective.objective_id);
                  console.log(isCompleted);
                  if(isCompleted) {
                    await unCompleteObjective(objective.objective_id);
                  } else await completeObjective(objective.objective_id);
                }} />
                <br />
            {/each}
        </Column>
    {/if}
{/if}
</Column>
