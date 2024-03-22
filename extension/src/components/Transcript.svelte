<script lang="ts">
	import { getContext } from "svelte";
	import { transcript, lastReceivedCaptions, type LangCode } from "../lib/captions";
	import LanguageSelect from "./LanguageSelect.svelte";
	import Warning from "./Warning.svelte";
	import type { Resetable } from "../lib/stores/resetablePersisted";

	const language = getContext<Resetable<LangCode>>('language');

	/** Scroll to bottom each time one of the parameters changes */
	const autoScroll = (node: HTMLElement, parameters: any) => {
		const scroll = () => node.scroll({
			top: node.scrollHeight
		});
		scroll();
		return {
			update: scroll,
		}
	};
</script>

<div class="container">
	<div class="top">
		<h2>Live transcript</h2>
		{#if $lastReceivedCaptions.length > 1}
			<div class="language">
				<label for="language-input">Language:</label>
				<div class="language-select">
					<LanguageSelect />
				</div>
			</div>
		{/if}
	</div>
	<!-- When transcript or language change, scroll to bottom -->
	<div class="transcript" use:autoScroll={ { $transcript, $language } } > 
		{#if $lastReceivedCaptions.length === 0}
			<div class="warning-container">
				<Warning>Waiting for broadcaster speech</Warning>
			</div>
		{/if}

		{#each $transcript as line, i }
			<div class="line">
				{#if line[0]?.speaker}
					<b>{line[0].speaker}: </b>
				{/if}
			</div>
			{#each line as part }
				{ ( part.captions.find(alt=>alt.lang === $language) ?? part.captions[0] ).text }
			{/each}
		{/each}
	</div>
</div>


<style lang="scss">
	@import '../assets/vars.scss';

	.container { height: 100%; width: 100%; }
	.container { background-color: $theme-background-color; color: $theme-text-color; }
	.container { font-size: $theme-font-size; font-family: $theme-font-family; }
	.container {
		display: flex;
		flex-direction: column;
	}

	.warning-container { display: flex; justify-content: center;}

	.top { background-color: $settings-background-color; width: 100%; }
	.top h2 { display: block; font-size: 1.25em; text-align: center; margin: 0 .5em; padding: .25em 0; font-weight: normal; }
	.top .language { margin: 0 .5em .5em; display: flex; justify-content: flex-start; gap: .5em; }
	.language-select { min-width: 0; }

	.transcript { overflow-y: auto; margin: 0;}
	.transcript .line { padding: .25em .5em; }
</style>