<script lang="ts">
    import Settings from "./Settings.svelte";
	import { transcript } from "../lib/captions";
    import { settings } from "../lib/settings";

	export let overlay = false;
	export let transcriptShown = false;

	let settingsShown = false;

	const scrollToBottom = (node: HTMLElement, parameters: any) => {
		const scroll = () => node.scroll({
			top: node.scrollHeight
		});
		scroll();
		return { update: scroll }
	};
</script>

{#if !overlay || transcriptShown }
	<div class="container">
		<div class="top">
			<h2>Transcript</h2>
			{#if overlay}
				<button	class="topright" on:click={()=>{ transcriptShown = false; }} >
					Close transcript
				</button>
			{:else}
				<button class="topright" on:click={ ()=>{ settingsShown = true } } >
					Settings
				</button>
				<Settings bind:settingsShown />
			{/if}
		</div>
		<div class="transcript" use:scrollToBottom={ {$transcript, $settings }} style="background: { $settings.backgroundColor };" >
			{#each $transcript as line }
				<div class="line" style="color: { $settings.textColor }; font-size: { $settings.fontSize }px;">{ (line.find(t=>t.lang === $settings.language) || line[0]).text }</div>
			{/each}
		</div>
	</div>	
{/if}


<style>
	.container { height: 100%; width: 100%; background: #111; font-family: Arial, Helvetica, sans-serif; }
	.top { background: #333; color: #eee; height: 2.5em; }
	h2 { font-size: 1.25em; display: block; margin: 0 .5em; text-align: center; padding-top: .25em; }
	button.topright { position: absolute; top: 0; right: 0; }
	.transcript { overflow-y: auto; margin: 0; height: calc(100% - 2.5em); }
	.line { color: #eee; padding: .25em .5em; }
	.line:not(:first-child) { border-top: 1px solid #333; }
</style>