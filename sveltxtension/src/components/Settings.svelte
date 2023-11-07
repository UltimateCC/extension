<script lang="ts">
    import { finalCaptions, partialCaptions, transcript } from "../lib/captions";
    import { settings, resetSettings, position } from "../lib/settings";
	import ColorPicker, { ChromeVariant } from 'svelte-awesome-color-picker';
    import LanguageSelect from "./LanguageSelect.svelte";

	export let settingsShown = false;

	let current = '';
	function toggle(id: string) {
		if(current===id) {
			current = '';
		}else{
			current = id;
		}
	}

	// Clear captions each time language changes
	$: clearCaptions($settings.language);

	function clearCaptions(lang: string) {
		// Reset partial captions
		$partialCaptions = '';

		// Add last sentence to captions in selected language, or spoken language, or empty
		const lastTranscript = $transcript[$transcript.length-1] || [];
		$finalCaptions = ( lastTranscript?.find(c=>c.lang===lang) || lastTranscript[0] )?.text || '';
	}

	// Close on click outside
	let settingsElem: HTMLElement;
	function handleClick(e: MouseEvent) {
		if(settingsShown && settingsElem && !e.defaultPrevented && !settingsElem.contains(e.target as Node)) {
			settingsShown = false;
		}
	}
</script>

<svelte:window on:click={handleClick} />

{#if settingsShown}
	<div id="settings-container" bind:this={settingsElem}>
		<div class="caption-header-container">
			<h2>Ultimate CC</h2>
			<button type="button" id="close-settings-button" on:click={()=>{ settingsShown = false; }}>
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
					<polygon xmlns="http://www.w3.org/2000/svg" points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
				</svg>
			</button>
		</div>
		<div class="caption-settings-container">
			<!-- Language -->
			<div class="caption-group" id="language">
				<div class="caption-group-header">
					<h3>Language</h3>
					<LanguageSelect />
				</div>
			</div>

			<!-- Text -->
			<div class="caption-group" class:isOpen={ current === 'text' } >
				<div class="caption-group-header">
					<h3>Text</h3>
					<button type="button" class="chevron" on:click={()=>toggle('text')}>
						<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512">
							<!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
							<path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
						</svg>
					</button>
				</div>
				{#if current === 'text'}
					<div class="caption-group-content">
						<div class="caption-group-content-item">
							<label for="font-color-input">Text Color</label>
							<input type="color" id="font-color-input" bind:value={ $settings.textColor } />
						</div>
						<div class="caption-group-content-item">
							<label for="font-size-input">Text Size</label>
							<div class="caption-number-container">
								<input type="number" id="font-size-input" bind:value={ $settings.fontSize }  min="6" max="100" step="1" />
							</div>
						</div>
						<div class="caption-group-content-item group-font-family">
							<label for="font-family-input">Font family</label>
							<select id="font-family-input" bind:value={ $settings.fontFamily }>
								<option value="Arial, Helvetica, sans-serif">Arial</option>
								<option value="Calibri, sans-serif">Calibri</option>
								<option value="Courier New, Courier, monospace">Courier New</option>
								<option value="OpenDyslexic, sans-serif">OpenDyslexic</option>
								<option value="Roboto, sans-serif">Roboto</option>
								<option value="Times New Roman, Times, serif">Times New Roman</option>
								<option value="Verdana, sans-serif">Verdana</option>
							</select>
						</div>
						<div class="caption-group-content-item">
							<label for="max-lines-input">Max lines</label>
							<input type="number" id="max-lines-input" bind:value={ $settings.maxLines } min="1" max="20" step="1" />
						</div>
					</div>
				{/if}
			</div>

			<!-- Background -->
			<div class="caption-group" class:isOpen={ current === 'background' }>
				<div class="caption-group-header">
					<h3>Background</h3>
					<button type="button" class="chevron" on:click={()=>toggle('background')}>
						<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512">
							<!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
							<path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
						</svg>
					</button>
				</div>
				{#if current === 'background'}
					<div class="caption-group-content">
						<div class="caption-group-content-item">
							<label for="bg-color-input">Color</label>
							<input type="color" id="bg-color-input" bind:value={ $settings.backgroundColor } />
						</div>
						<div class="caption-group-content-item group-opacity">
							<div>
								<label for="bg-opacity-number-input">Opacity</label>
								<div class="caption-number-container">
									<input type="number" id="bg-opacity-number-input" bind:value={ $settings.backgroundOpacity } min="0" max="100" step="1" />
								</div>
							</div>
							<input type="range" id="bg-opacity-range-input" bind:value={ $settings.backgroundOpacity } min="0" max="100" step="1" />
						</div>
					</div>					
				{/if}
			</div>
		</div>

		<!-- Reset -->
		<div class="caption-button-container">
			<div>
				<button type="button" on:click={ resetSettings }>
					Reset settings
				</button>
				<button type="button" on:click={ ()=>{ position.set({}); } }>
					Reset position
				</button>
			</div>
			<button type="button" id="caption-lock-position" on:click={ ()=>{ $settings.positionLocked =! $settings.positionLocked} }>
				{ $settings.positionLocked ? 'Unlock' : 'Lock' } position
			</button>
		</div>
	</div>
{/if}
