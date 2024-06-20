<script lang="ts">
    export let settingsProp: string;
    export let value: string;
</script>

<button type="button" class="input-button" on:click={() => { settingsProp = value; }} class:active={settingsProp === value}>
    <slot />
</button>