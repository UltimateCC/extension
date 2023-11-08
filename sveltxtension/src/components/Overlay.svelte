<script lang="ts">
    import Settings from "./Settings.svelte";
    import { twitchContext } from "../lib/twitch";
    import Transcript from "./Transcript.svelte";
    import { fade } from "svelte/transition";
    import Captions from "./Captions.svelte";

	let settingsShown = false;
	let transcriptShown = false;
	let captionsShown = true;

	function toggleCaptions() {
		captionsShown = !captionsShown;
	}

	function toggleSettings(e: Event) {
		// Prevent closing settings instantly because click outside
		e.preventDefault();
		transcriptShown = false;
		settingsShown = !settingsShown;
	}

	function toggleTranscript() {
		settingsShown = false;
		transcriptShown = !transcriptShown;
	}
</script>

<div id="ultimate-closed-caption">

	{#if captionsShown}
		<Captions />
	{/if}

	<div class="caption-overlay-container">
		<Settings bind:settingsShown />
		<Transcript overlay={true} bind:transcriptShown />
	</div>

	{#if $twitchContext.arePlayerControlsVisible}

		<div id="buttons-container" transition:fade={ { duration: 100 } }>
			<button id="toggle-captions" type="button" on:click={toggleCaptions}>
				{#if captionsShown }
					<!-- Hide captions -->
					<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="auto" viewBox="0 -960 960 960">
						<path d="M275-800h485q33 0 56.5 23.5T840-720v485l-80-80v-405H355l-80-80Zm385 380q0-8 6-14t14-6h20q8 0 14 6t6 14v20q0 9-3.5 17.5T706-369l-51-51h5ZM560-600h120q17 0 28.5 11.5T720-560v25q0 8-6 14t-14 6h-20q-8 0-14-6t-6-14v-5h-80v45l-60-60v-5q0-17 11.5-28.5T560-600Zm-2 82Zm-154 74Zm-43-156 60 60H300v120h80v-5q0-8 6-14t14-6h20q8 0 14 6t6 14v25q0 17-11.5 28.5T400-360H280q-17 0-28.5-11.5T240-400v-160q0-17 11.5-28.5T280-600h81ZM168-793l73 73h-41v480h407L55-792q-12-12-12-28.5T55-849q12-12 28.5-12t28.5 12l736 736q12 12 12 28t-12 28q-12 12-28.5 12T791-57L687-160H200q-33 0-56.5-23.5T120-240v-480q0-25 13.5-44.5T168-793Z"/>
					</svg>
				{:else}
					<!-- Show captions -->
					<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="auto" viewBox="0 -960 960 960">
						<path d="M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H200Zm0-80h560v-480H200v480Zm80-120h120q17 0 28.5-11.5T440-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T400-600H280q-17 0-28.5 11.5T240-560v160q0 17 11.5 28.5T280-360Zm400-240H560q-17 0-28.5 11.5T520-560v160q0 17 11.5 28.5T560-360h120q17 0 28.5-11.5T720-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T680-600ZM200-240v-480 480Z"/>
					</svg>
				{/if}
			</button>
			<button id="toggle-settings" type="button" on:click={toggleSettings}>
				<!-- Open settings -->
				<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="auto" viewBox="0 -960 960 960">
					<path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
				</svg>
			</button>
			<!--
			<button on:click={ toggleTranscript }>
				Transcript
			</button>
			-->
		</div>
	{/if}
</div>
