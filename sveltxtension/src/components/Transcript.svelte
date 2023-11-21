<script lang="ts">
	import { lastTranscript, partialCaptions, transcript } from "../lib/captions";
    import { settings } from "../lib/settings";
    import LanguageSelect from "./LanguageSelect.svelte";
    import Warning from "./Warning.svelte";

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
		<div class="language">
			<label for="language-input">Language:</label>
			<div class="language-select">
				<LanguageSelect />
			</div>
		</div>
	</div>
	<div class="transcript" use:autoScroll={ { $transcript, $partialCaptions, $settings } } >
		{#if !$transcript.length && !$partialCaptions}
			<Warning>Waiting for broadcaster speech</Warning>
		{/if}

		{#each $transcript as line }
			<div class="line">
				{ (line.find(t=>t.lang === $settings.language) || line[0]).text }
			</div>
		{/each}
		{#if $partialCaptions }
			<div class="line">
				{ $partialCaptions }
			</div>
		{/if}
	</div>
</div>	


<style lang="scss">
	@import '../assets/vars.scss';

	.container { height: 100%; width: 100%; }
	.container { background-color: $theme-background-color; color: $theme-text-color; }
	.container { font-size: $theme-font-size; font-family: $theme-font-family; }

	.top { height: 4em; background-color: $settings-background-color; width: 100%; }
	.top h2 { display: block; font-size: 1.25em; text-align: center; margin: 0 .5em; padding-top: .25em; font-weight: normal; }
	.top .language { margin: .25em .5em; display: flex; justify-content: flex-start; gap: .5em; }
	.language-select { min-width: 0; }

	.transcript { overflow-y: auto; margin: 0; height: calc(100% - 4em); }
	.transcript .line { padding: .25em .5em; }
</style>