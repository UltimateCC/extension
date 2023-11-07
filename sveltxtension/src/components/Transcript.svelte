<script lang="ts">
	import { transcript } from "../lib/captions";
    import { settings } from "../lib/settings";
    import LanguageSelect from "./LanguageSelect.svelte";

	export let overlay = false;
	export let transcriptShown = false;

	const scrollToBottom = (node: HTMLElement, parameters: any) => {
		const scroll = () => node.scroll({
			top: node.scrollHeight
		});
		scroll();
		return {
			update: scroll
		}
	};
</script>

{#if !overlay || transcriptShown }
	<div class="container">
		<div class="top">
			<h2>Live transcript</h2>
			<div class="language">
				<label for="language-input">Language</label>
				<LanguageSelect />
			</div>
			{#if overlay}
				<button	class="topright" on:click={()=>{ transcriptShown = false; }} >
					Close transcript
				</button>
			{/if}
		</div>
		<div class="transcript" use:scrollToBottom={ {$transcript, $settings }} >
			{#each $transcript as line }
				<div class="line">
					{ (line.find(t=>t.lang === $settings.language) || line[0]).text }
				</div>
			{/each}
		</div>
	</div>	
{/if}

<style lang="scss">
	.container { height: 100%; width: 100%; background-color: $theme-background-color; color: $theme-text-color; }
	.container { font-size: $theme-font-size; font-family: $theme-font-family; }

	.top { height: 4em; background: #1F1F23; }
	h2 { font-size: 1.25em; display: block; margin: 0 .5em; text-align: center; padding-top: .25em; }
	.language { margin: .25em .5em; }
	button.topright { position: absolute; top: 0; right: 0; }

	.transcript { overflow-y: auto; margin: 0; height: calc(100% - 4em); }
	.line { padding: .25em .5em; }
</style>