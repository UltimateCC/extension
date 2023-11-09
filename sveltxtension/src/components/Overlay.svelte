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
	/*
	function toggleTranscript() {
		settingsShown = false;
		transcriptShown = !transcriptShown;
	}*/
</script>

<div id="ultimate-closed-caption">

	{#if captionsShown || settingsShown }
		<Captions bind:settingsShown />
	{/if}

	<div class="caption-overlay-container">
		<Settings bind:settingsShown />
		<!--
		<Transcript overlay={true} bind:transcriptShown />
		-->
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
			<!--
			<button on:click={ toggleTranscript }>
				Transcript
			</button>-->
			<button id="toggle-settings" type="button" on:click={toggleSettings}>
				<!-- Open settings -->
				<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="auto" viewBox="0 -960 960 960">
					<path d="m387.694-100.001-15.231-121.846q-16.077-5.385-32.962-15.077-16.885-9.693-30.193-20.77l-112.846 47.692L104.156-370l97.615-73.769q-1.385-8.923-1.962-17.923-.577-9-.577-17.923 0-8.539.577-17.347.577-8.808 1.962-19.269L104.156-590l92.306-159.229 112.461 47.308q14.462-11.462 30.885-20.962 16.424-9.501 32.27-15.27l15.616-121.846h184.612l15.231 122.231q18 6.538 32.578 15.269 14.577 8.731 29.423 20.578l114-47.308L855.844-590l-99.153 74.922q2.154 9.693 2.346 18.116.192 8.423.192 16.962 0 8.154-.384 16.577-.385 8.423-2.77 19.27L854.46-370l-92.307 159.998-112.615-48.077q-14.846 11.847-30.308 20.962-15.462 9.116-31.693 14.885l-15.231 122.231H387.694Zm92.767-260q49.923 0 84.961-35.038Q600.46-430.078 600.46-480t-35.038-84.961q-35.038-35.038-84.961-35.038-50.537 0-85.268 35.038-34.73 35.039-34.73 84.961t34.73 84.961q34.731 35.038 85.268 35.038Z"/>
				</svg>
			</button>
		</div>
	{/if}
</div>
