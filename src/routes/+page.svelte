<script lang="ts">
    import { AppConfig } from "$lib/config";
    import { Column, getUserData, Heading, Text } from "duckylib";

</script>

<Column
    widthPx="fit"
    heightPx="fit"
    justifyContent="center"
    alignItems="flex-start"
    textAlign="left"
>
    {#if !getUserData()}
        <Heading size={4} weight="bold"
            >This app has Twitch authorization</Heading
        >
        <ul>
            {#each AppConfig.scopes as scope}
                <li>{scope}</li>    
            {/each}
        </ul>
    {:else}
        <Heading size={4} weight="bold"
            >Hello, {getUserData()?.username}!</Heading
        >
        <Text>You got it from here!</Text>
        <ul>
            {#each AppConfig.scopes as scope}
                <li>{scope}</li>    
            {/each}
        </ul>
    {/if}
</Column>
