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
			update: scroll,
		}
	};
</script>

{#if !overlay || transcriptShown }
	<div class="container" style:opacity={ overlay ? .9 : 1 }>
		<div class="top">
			{#if overlay}
				<button	class="topright" on:click={()=>{ transcriptShown = false; }} >
					<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
						<polygon xmlns="http://www.w3.org/2000/svg" points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
					</svg>
				</button>
			{/if}
			<h2>Live transcript</h2>
			<div class="language">
				<label for="language-input">Language:</label>
				<LanguageSelect />
			</div>
		</div>
		<div class="transcript" use:scrollToBottom={ { $transcript, $settings } } >
			{#each $transcript as line }
				<div class="line">
					{ (line.find(t=>t.lang === $settings.language) || line[0]).text }
				</div>
			{/each}
		</div>
	</div>	
{/if}

<style lang="scss">
	@import '../assets/vars.scss';

	.container { height: 100%; width: 100%; }
	.container { background-color: $theme-background-color; color: $theme-text-color; }
	.container { font-size: $theme-font-size; font-family: $theme-font-family; }

	.top { height: 4em; background-color: $settings-background-color; }
	.top h2 { display: block; font-size: 1.25em; text-align: center; margin: 0 .5em; padding-top: .25em; font-weight: normal; }
	.top .language { margin: .25em .5em; display: flex; justify-content: flex-start; gap: .5em; }

	button.topright { position: absolute; top: 0; right: 0; font-size: 2em; border: none; background: none; }
	button.topright { cursor: pointer; transition: transform 0.2s ease-in-out; }
	button.topright:hover { transform: scale(1.1); }
	button.topright polygon { fill: $settings-text-color; }

	.transcript { overflow-y: auto; margin: 0; height: calc(100% - 4em); }
	.transcript .line { padding: .25em .5em; }
</style>