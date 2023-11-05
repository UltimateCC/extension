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

	function toggleSettings() {
		transcriptShown = false;
		settingsShown = !settingsShown;
	}

	function toggleTranscript() {
		settingsShown = false;
		transcriptShown = !transcriptShown;
	}
</script>

<div id="ultimate-closed-caption">

	<Captions bind:captionsShown />

	<Settings bind:settingsShown />
	<!--
		<Transcript overlay={true} bind:transcriptShown />
	-->

	{#if $twitchContext.arePlayerControlsVisible}

		<div id="buttons-container" transition:fade={ { duration: 100 } }>
			<button id="toggle-captions" type="button" on:click={toggleCaptions}>
				{#if captionsShown }
					<!-- Hide captions icon -->
					<svg xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 -960 960 960">
						<path d="M275-800h485q33 0 56.5 23.5T840-720v485l-80-80v-405H355l-80-80Zm385 380q0-8 6-14t14-6h20q8 0 14 6t6 14v20q0 9-3.5 17.5T706-369l-51-51h5ZM560-600h120q17 0 28.5 11.5T720-560v25q0 8-6 14t-14 6h-20q-8 0-14-6t-6-14v-5h-80v45l-60-60v-5q0-17 11.5-28.5T560-600Zm-2 82Zm-154 74Zm-43-156 60 60H300v120h80v-5q0-8 6-14t14-6h20q8 0 14 6t6 14v25q0 17-11.5 28.5T400-360H280q-17 0-28.5-11.5T240-400v-160q0-17 11.5-28.5T280-600h81ZM168-793l73 73h-41v480h407L55-792q-12-12-12-28.5T55-849q12-12 28.5-12t28.5 12l736 736q12 12 12 28t-12 28q-12 12-28.5 12T791-57L687-160H200q-33 0-56.5-23.5T120-240v-480q0-25 13.5-44.5T168-793Z"/>
					</svg>
				{:else}
					<!-- Show captions icon -->
					<svg xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 -960 960 960">
						<path d="M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H200Zm0-80h560v-480H200v480Zm80-120h120q17 0 28.5-11.5T440-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T400-600H280q-17 0-28.5 11.5T240-560v160q0 17 11.5 28.5T280-360Zm400-240H560q-17 0-28.5 11.5T520-560v160q0 17 11.5 28.5T560-360h120q17 0 28.5-11.5T720-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T680-600ZM200-240v-480 480Z"/>
					</svg>
				{/if}
			</button>
			<button id="toggle-settings" type="button" on:click={toggleSettings}>
				<!-- Open settings icon -->
				<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
					<!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
					<path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
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
