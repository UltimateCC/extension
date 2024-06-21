<script lang="ts">
	import { getContext } from "svelte";
	import languages from "../assets/languages.json";
	import { lastReceivedCaptions } from "../lib/captions";
	import { settings } from "../lib/settings";
	import type { Resetable } from "../lib/stores/resetablePersisted";
	import { isRTL, type LangCode } from "../lib/utils";

	const language = getContext<Resetable<LangCode>>('language');

	// Spoken language name
	$: spokenLang = languages[$lastReceivedCaptions[0]?.lang] || $lastReceivedCaptions[0]?.lang || 'Portugese';

	// Selected language name
	$: currentLangName = languages[$language as LangCode] ?? $language;

	// Update text align depending on the current text alignment
	function updateTextAlign(newLanguage: LangCode) {
		console.log(newLanguage);
		if ($settings.textAlign == "left" && isRTL(newLanguage)) {
			$settings.textAlign = "right";
		} else if ($settings.textAlign == "right" && !isRTL(newLanguage)) {
			$settings.textAlign = "left";
		}
	}
	$: updateTextAlign($language ?? "en");
</script>

<select id="language-input" bind:value={$language} >
	<option value="">Default { spokenLang ? `(${spokenLang})` : '' }</option>

	<!-- Show current selected lang if not available -->
	{#if $language && !$lastReceivedCaptions.some(alt=>alt.lang === $language) }
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