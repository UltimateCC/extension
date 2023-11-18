<script lang="ts">
    import { transcript, type Caption } from "../lib/captions";
	import languages from "../assets/languages.json";
    import { settings } from "../lib/settings";

	// Last received languages are used as base list
	$: lastTranscript = $transcript[$transcript.length-1] || [];
	$: spokenLang = languages[lastTranscript[0]?.lang] || lastTranscript[0]?.lang || '';
</script>

{#if lastTranscript.length > 1}
	<select id="language-input" bind:value={$settings.language}>
		<option value="">Spoken language{ spokenLang ? (' (' + spokenLang + ')') : '' }</option>
		{#each lastTranscript as l }
			<option value={l.lang}>{ languages[l.lang] || l.lang }</option>
		{/each}
	</select>
{:else}
	<select id="language-input" disabled>
		<option selected>Translations unavailable</option>
	</select>
{/if}

<style lang="scss">
	@import '../assets/vars.scss';

	select { border: 0; border-radius: $settings-input-border-radius; box-shadow: $settings-input-shadow; }
	select { color: rgba($settings-background-color, 0.85); background-color: $settings-text-color; }
	select { height: 1.5em; width: 100%; font-size: 0.9em; overflow: hidden; padding-left: 0.5em; }

	select:disabled { background-color: $settings-disabled-color; }
</style>