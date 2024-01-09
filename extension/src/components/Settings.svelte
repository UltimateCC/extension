<script lang="ts">
	import { lastTranscript, partialCaptions } from "../lib/captions";
	import { settings, resetSettings, position, resetPosition, language } from "../lib/settings";
	import LanguageSelect from "./LanguageSelect.svelte";
    import { fade } from "svelte/transition";
    import NumberInput from "./NumberInput.svelte";
    import Warning from "./Warning.svelte";
    import Chevron from "./Chevron.svelte";

	export let settingsShown = false;

	let current = '';
	function toggle(id: string) {
		if(current===id) {
			current = '';
		}else{
			current = id;
		}
	}

	// Clear partial captions each time language changes
	$: clearCaptions($language);

	function clearCaptions(lang: string) {
		// Reset partial captions when lang changed
		$partialCaptions = '';
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
	<div id="settings-container" bind:this={settingsElem} transition:fade={ { duration: 100 } } data-simplebar>
		<div class="caption-header-container">
			<h2>Captions settings</h2>
			<button type="button" id="close-settings-button" on:click={()=>{ settingsShown = false; }}>
				<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 -960 960 960" width="1em">
					<path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
				</svg>
			</button>
		</div>
		<div class="caption-settings-container">
			{#if $lastTranscript.length !== 1}
				<!-- Language -->
				<div class="caption-group" id="language">
					{#if $lastTranscript.length === 0}
						<Warning>Waiting for broadcaster speech</Warning>
					{:else}
						<div class="caption-group-header">
							<h3>Language</h3>
							<LanguageSelect />	
						</div>	
					{/if}
				</div>
			{/if}

			<!-- Text -->
			<div class="caption-group" class:isOpen={ current === 'text' } >
				<button type="button" class="caption-group-header" on:click={()=>toggle('text')}>
					<h3>Text</h3>
					<Chevron/>
				</button>
				{#if current === 'text'}
					<div class="caption-group-content">
						<div class="caption-group-content-item">
							<label for="font-color-input">Text Color</label>
							<input type="color" id="font-color-input" bind:value={$settings.textColor}/>
						</div>
						<div class="caption-group-content-item group-font-size">
							<div>
								<label for="font-size-input">Text Size</label>
								<NumberInput id="font-size-input"
									bind:value={ $settings.fontSize } 
									min={6} max={48} step=1
								/>
							</div>
							<input type="range" bind:value={ $settings.fontSize } min="6" max="48" step="1" />
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
					</div>
				{/if}
			</div>

			<!-- Background -->
			<div class="caption-group" class:isOpen={ current === 'background' }>
				<button type="button" class="caption-group-header" on:click={()=>toggle('background')}>
					<h3>Background</h3>
					<Chevron/>
				</button>
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
									<NumberInput id="bg-opacity-number-input"
										bind:value={ $settings.backgroundOpacity } 
										min={0} max={100} step=1
									/>
									<div class="units">
										<span class="invisible">{ $settings.backgroundOpacity }</span>
										<span class="caption-unit">%</span>
									</div>
								</div>
							</div>
							<input type="range" bind:value={ $settings.backgroundOpacity } min="0" max="100" step="1" />
						</div>
					</div>					
				{/if}
			</div>
		</div>

		<div class="caption-button-container">
			<!-- Reset -->
			<div>
				<button type="button" on:click={ resetSettings }>
					Reset settings
				</button>
				<button type="button" on:click={ resetPosition }>
					Reset position
				</button>
			</div>
			<button type="button" class="caption-lock-position" on:click={ ()=>{ $position.locked =! $position.locked } }>
				{ $position.locked ? 'Unlock' : 'Lock' } position
			</button>
		</div>
	</div>
{/if}
