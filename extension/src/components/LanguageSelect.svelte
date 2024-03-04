<script lang="ts">
    import { type LangCode, lastReceivedCaptions, partialCaptions } from "../lib/captions";
	import languages from "../assets/languages.json";
    import { language } from "../lib/settings";

	// Spoken language name
	$: spokenLang = languages[$lastReceivedCaptions[0]?.lang] || $lastReceivedCaptions[0]?.lang || '';

	// Selected language name
	$: currentLangName = languages[$language as LangCode] ?? $language;

	// Clear partial captions each time language changes
	$: clearCaptions($language);

	function clearCaptions(lang: string) {
		// Reset partial captions when lang changed
		partialCaptions.clear();
	}

</script>


<select id="language-input" bind:value={$language}>
	<option value="">Spoken language{ spokenLang ? ` (${spokenLang})` : '' }</option>

	<!-- Show current selected lang if not available -->
	{#if $language && !$lastReceivedCaptions.some(alt=>alt.lang===$language) }
		<option value={$language}>{ currentLangName } (unavailable)</option>
	{/if}

	<!-- List all available langs -->
	{#each $lastReceivedCaptions as l }
		<option value={l.lang}>{ languages[l.lang] || l.lang }</option>
	{/each}
</select>

<style lang="scss">
	@import '../assets/vars.scss';

	select { border: 0; border-radius: $settings-input-border-radius; box-shadow: $settings-input-shadow; }
	select { color: rgba($settings-background-color, 0.85); background-color: $settings-text-color; }
	select { height: 1.5em; font-size: 0.9em; overflow: hidden; padding-left: 0.5em; max-width: 100%; }

	select:disabled { background-color: $settings-disabled-color; }
</style>