<script lang="ts">
	import { getContext } from "svelte";
	import { fly, slide } from "svelte/transition";
	import { lastReceivedCaptions } from "../lib/captions";
	import { position, settings } from "../lib/settings";
	import type { Resetable } from "../lib/stores/resetablePersisted";
	import type { LangCode } from "../lib/utils";
	import DropdownIcon from "./DropdownIcon.svelte";
	import InputButton from "./InputButton.svelte";
	import LanguageSelect from "./LanguageSelect.svelte";
	import NumberInput from "./NumberInput.svelte";
	import Warning from "./Warning.svelte";

	const language = getContext<Resetable<LangCode>>('language');

	export let settingsShown = false;

	let current = '';
	function toggle(id: string) {
		if(current===id) {
			current = '';
		}else{
			current = id;
		}
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

<div id="settings-container" bind:this={settingsElem} transition:fly={{ x: "-100%", duration: 250 }}>
	<button type="button" id="close-settings-button" on:click={()=>{ settingsShown = false; }} aria-label="Close settings">
		<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 500 500">
			<path class="cls-1" d="M20.99,105.85l37.28,37.28c29.6,29.6,59.2,59.2,88.8,88.8,36.03,36.03,72.06,72.06,108.08,108.08,31.04,31.04,62.08,62.08,93.12,93.12,15.08,15.08,30.01,30.33,45.24,45.24.21.21.42.42.63.63,10.88,10.88,27.04,17.57,42.43,17.57s32.29-6.54,42.43-17.57,18.29-26.45,17.57-42.43-6.09-30.94-17.57-42.43l-37.28-37.28c-29.6-29.6-59.2-59.2-88.8-88.8-36.03-36.03-72.06-72.06-108.08-108.08-31.04-31.04-62.08-62.08-93.12-93.12-15.08-15.08-30.01-30.33-45.24-45.24-.21-.21-.42-.42-.63-.63C94.97,10.11,78.81,3.42,63.42,3.42S31.13,9.96,20.99,20.99C10.5,32.43,2.71,47.44,3.42,63.42s6.09,30.94,17.57,42.43h0Z"/>
			  <path class="cls-1" d="M105.85,479.01c12.43-12.43,24.86-24.86,37.28-37.28,29.6-29.6,59.2-59.2,88.8-88.8,36.03-36.03,72.06-72.06,108.08-108.08,31.04-31.04,62.08-62.08,93.12-93.12,15.08-15.08,30.33-30.01,45.24-45.24.21-.21.42-.42.63-.63,10.88-10.88,17.57-27.04,17.57-42.43s-6.54-32.29-17.57-42.43c-11.43-10.5-26.45-18.29-42.43-17.57s-30.94,6.09-42.43,17.57c-12.43,12.43-24.86,24.86-37.28,37.28-29.6,29.6-59.2,59.2-88.8,88.8-36.03,36.03-72.06,72.06-108.08,108.08l-93.12,93.12c-15.08,15.08-30.33,30.01-45.24,45.24-.21.21-.42.42-.63.63-10.88,10.88-17.57,27.04-17.57,42.43s6.54,32.29,17.57,42.43,26.45,18.29,42.43,17.57c15.92-.71,30.94-6.09,42.43-17.57h0Z"/>
		</svg>
	</button>
	<div id="settings-main" class="settings-box" data-simplebar>
		<div class="caption-settings-container">
			{#if $lastReceivedCaptions.length !== 1}
				<!-- Language -->
				<div class="caption-group" id="language">
					{#if $lastReceivedCaptions.length === 0}
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
					<DropdownIcon />
				</button>
				{#if current === 'text'}
					<div class="caption-group-content-container" transition:slide={{duration: 200}}>
						<div class="vertical-bar"></div>
						<div class="caption-group-content">
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
								<label for="font-color-input">Text Color</label>
								<input type="color" id="font-color-input" bind:value={$settings.textColor}/>
							</div>
							<div class="caption-group-content-item group-font-size">
								<div>
									<label for="font-size-input">Text Size</label>
									<div class="caption-number-container">
										<NumberInput id="font-size-input"
											bind:value={ $settings.fontSize } 
											min={6} max={48} step=1
										/>
										<div class="units">
											<span class="invisible">{ $settings.fontSize }</span>
											<span class="caption-unit">px</span>
										</div>
									</div>
									
								</div>
								<input type="range" bind:value={ $settings.fontSize } min="6" max="48" step="1" />
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Background -->
			<div class="caption-group" class:isOpen={ current === 'background' }>
				<button type="button" class="caption-group-header" on:click={()=>toggle('background')}>
					<h3>Background</h3>
					<DropdownIcon />
				</button>
				{#if current === 'background'}
					<div class="caption-group-content-container" transition:slide={{duration: 200}}>
						<div class="vertical-bar"></div>
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
					</div>	

				{/if}
			</div>
		</div>

		<div class="caption-button-container">
			<!-- Reset -->
			<div>
				<button type="button" on:click={ () =>{ settings.reset(); language.reset();} }>
					<span>Reset</span>
					<span>settings</span>
				</button>
				<button type="button" on:click={ () => position.reset() }>
					<span>Reset</span>
					<span>layout</span>
				</button>
			</div>
			<button type="button" class="caption-lock-position" on:click={ ()=>{ $position.locked =! $position.locked } }>
				{ $position.locked ? 'Unlock' : 'Lock' } layout
			</button>
		</div>
	</div>
	<div id="settings-details-navbar" class="settings-box">
		<!-- Guide link -->
		<a href="http://guide.ultimatecc.net" target="_blank" rel="noreferrer" class="navbar-button" id="guide-link">
			<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 61 61">
				<circle cx="30.5" cy="30.5" r="26.5" stroke-width="8" fill="none" />
				<path d="M31 29L31 43" stroke-width="8" stroke-linecap="round" />
				<circle cx="31" cy="18" r="4" />
			</svg>					
		</a>
		<div class="navbar-button-container" class:isOpen={ current === 'details' }>
			<!-- Settings details -->
			<div class="navbar-button-open">
				<button type="button" on:click={()=>toggle('details')} class="navbar-button" id="toggle-details">
					<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 610 610">
						<path d="M305.54,605.03c26.52-.05,51.91-6.1,68.61-25.18,16.7-19.08,17.2-39.39,18.15-51.75.95-12.36,1.74-20.05,3.6-24.82,1.86-4.77,3.39-8.41,15.07-15.19,11.67-6.78,15.59-6.3,20.64-5.55,5.05.75,12.11,3.88,23.29,9.2,11.18,5.32,29.03,14.98,53.86,9.94,24.83-5.04,42.69-24.1,55.91-47.13,13.22-23.03,20.68-48.09,12.53-72.11-8.14-24.03-25.46-34.62-35.67-41.62-10.21-7-16.46-11.53-19.66-15.53-3.19-4-5.58-7.15-5.6-20.67-.02-13.52,2.35-16.68,5.53-20.69,3.18-4.01,9.41-8.56,19.6-15.6,10.19-7.04,27.46-17.69,35.52-41.75,8.06-24.06.51-49.09-12.79-72.07-13.3-22.98-31.23-41.98-56.08-46.93-24.85-4.95-42.66,4.77-53.82,10.13s-18.2,8.52-23.25,9.29c-5.05.77-8.97,1.27-20.66-5.47-11.7-6.74-13.25-10.38-15.12-15.14-1.88-4.76-2.7-12.45-3.69-24.81-.99-12.36-1.56-32.66-18.34-51.68-16.77-19.02-42.18-24.98-68.7-24.93-26.52.05-51.91,6.1-68.61,25.18-16.7,19.08-17.2,39.39-18.15,51.75-.95,12.36-1.74,20.05-3.6,24.82-1.86,4.77-3.39,8.41-15.07,15.19-11.67,6.78-15.59,6.3-20.64,5.55s-12.11-3.88-23.29-9.2c-11.18-5.32-29.03-14.98-53.86-9.94-24.83,5.04-42.69,24.1-55.91,47.13-13.22,23.03-20.68,48.09-12.53,72.11,8.14,24.03,25.46,34.62,35.67,41.62,10.21,7,16.46,11.53,19.66,15.53,3.19,4,5.58,7.15,5.6,20.67.02,13.52-2.35,16.68-5.53,20.69-3.18,4.01-9.41,8.56-19.6,15.6-10.19,7.04-27.46,17.69-35.52,41.75-8.06,24.06-.51,49.09,12.79,72.07,13.3,22.98,31.23,41.98,56.08,46.93,24.85,4.95,42.66-4.77,53.82-10.13,11.16-5.36,18.2-8.52,23.25-9.29s8.97-1.27,20.66,5.47c11.7,6.74,13.25,10.38,15.12,15.14,1.88,4.76,2.7,12.45,3.69,24.81.99,12.36,1.56,32.66,18.34,51.68,16.77,19.02,42.18,24.98,68.7,24.93h0ZM305.21,435.02c-72.2.13-130.1-57.55-130.23-129.78s57.56-130.12,129.76-130.25c72.2-.13,130.1,57.55,130.23,129.78.13,72.23-57.56,130.12-129.76,130.25Z"/>
						<path d="M305,225.01c-43.82,0-80,36.21-80,79.99s36.18,79.99,80,79.99,80-36.21,80-79.99-36.18-79.99-80-79.99h0Z"/>
					</svg>
				</button>
			</div>
			<div class="binder"></div>
		</div>
	</div>
	{#if current === 'details'}
		<div id="settings-details" class="settings-box" transition:slide={ { duration: 100 } }>
			<div class="settings-details-container">
				<div class="settings-details-header">
					<h3>Other settings</h3>
				</div>
				<div class="settings-details-content">
					<div class="caption-group-content-container">
						<div class="vertical-bar"></div>
						<div class="caption-group-content">
							<div class="caption-group-content-item">
								<label for="stroke-color-input">Stroke color</label>
								<input type="color" id="stroke-color-input" bind:value={ $settings.strokeColor } />
							</div>
							<div class="caption-group-content-item group-opacity">
								<div>
									<label for="bg-opacity-number-input">Stroke size</label>
									<div class="caption-number-container">
										<NumberInput id="bg-opacity-number-input"
											bind:value={ $settings.strokeSize } 
											min={0} max={2} step=0.05
										/>
										<div class="units">
											<span class="invisible">{ $settings.strokeSize }</span>
											<span class="caption-unit">px</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="settings-details-selector-container">
						<!-- Text align -->
						<div class="settings-details-selector">
							<InputButton bind:settingsProp={$settings.textAlign} value="left">
								<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 500 500">
									<rect x="33.24" y="69.51" width="433.52" height="73.86"/>
									<rect x="33.24" y="213.07" width="271.62" height="73.86"/>
									<rect x="33.24" y="356.63" width="433.52" height="73.86"/>
								</svg>
							</InputButton>
							<InputButton bind:settingsProp={$settings.textAlign} value="center">
								<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 500 500">
									<rect x="33.24" y="69.51" width="433.52" height="73.86"/>
									<rect x="114.19" y="213.07" width="271.62" height="73.86"/>
									<rect x="33.24" y="356.63" width="433.52" height="73.86"/>
								</svg>
							</InputButton>
							<InputButton bind:settingsProp={$settings.textAlign} value="right">
								<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 500 500">
									<rect x="33.24" y="69.51" width="433.52" height="73.86"/>
									<rect x="195.14" y="213.07" width="271.62" height="73.86"/>
									<rect x="33.24" y="356.63" width="433.52" height="73.86"/>
								</svg>
							</InputButton>
						</div>

						<!-- Text transform -->
						<div class="settings-details-selector">
							<InputButton bind:settingsProp={$settings.textTransform} value="uppercase">
								<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 500 500">
									<path d="M31.43,355.6l83.1-210h43.2l82.5,210h-51.6l-39.6-106.5c-1.6-4.2-3.2-8.7-4.8-13.5-1.6-4.8-3.2-9.75-4.8-14.85-1.6-5.1-3.15-10.1-4.65-15-1.5-4.9-2.75-9.45-3.75-13.65l9-.3c-1.2,5-2.55,9.9-4.05,14.7-1.5,4.8-3,9.55-4.5,14.25-1.5,4.7-3.15,9.4-4.95,14.1-1.8,4.7-3.5,9.55-5.1,14.55l-39.6,106.2H31.43ZM71.03,315.4l15.9-38.4h96.6l15.6,38.4H71.03Z"/>
									<path d="M357.83,358.6c-16.8,0-32-2.7-45.6-8.1-13.6-5.4-25.3-13-35.1-22.8-9.8-9.8-17.3-21.35-22.5-34.65-5.2-13.3-7.8-27.75-7.8-43.35s2.75-29.95,8.25-43.05c5.5-13.1,13.35-24.55,23.55-34.35,10.2-9.8,22.25-17.4,36.15-22.8,13.9-5.4,29.05-8.1,45.45-8.1,11.6,0,22.55,1.5,32.85,4.5,10.3,3,19.65,7.1,28.05,12.3,8.4,5.2,15.5,11.2,21.3,18l-30.9,32.7c-5-4.8-10.15-8.8-15.45-12-5.3-3.2-10.95-5.75-16.95-7.65-6-1.9-12.4-2.85-19.2-2.85-8.8,0-16.85,1.6-24.15,4.8-7.3,3.2-13.7,7.65-19.2,13.35-5.5,5.7-9.75,12.4-12.75,20.1-3,7.7-4.5,16.05-4.5,25.05s1.6,17.4,4.8,25.2c3.2,7.8,7.6,14.55,13.2,20.25,5.6,5.7,12.25,10.2,19.95,13.5,7.7,3.3,15.95,4.95,24.75,4.95,6.2,0,12.05-1,17.55-3,5.5-2,10.25-4.7,14.25-8.1,4-3.4,7.2-7.45,9.6-12.15,2.4-4.7,3.6-9.75,3.6-15.15v-7.8l6.6,10.2h-57.9v-39.9h98.7c.4,2.2.7,5.2.9,9,.2,3.8.35,7.5.45,11.1.1,3.6.15,6.3.15,8.1,0,13.6-2.45,26.05-7.35,37.35-4.9,11.3-11.75,21.05-20.55,29.25-8.8,8.2-19.2,14.6-31.2,19.2s-25,6.9-39,6.9Z"/>
								</svg>
							</InputButton>
							<InputButton bind:settingsProp={$settings.textTransform} value="lowercase">
								<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 500 500">
									<path d="M131.03,358.3c-13.4,0-25.35-3.55-35.85-10.65-10.5-7.1-18.85-16.9-25.05-29.4-6.2-12.5-9.3-26.65-9.3-42.45s3.1-30.5,9.3-42.9c6.2-12.4,14.7-22.15,25.5-29.25,10.8-7.1,23.1-10.65,36.9-10.65,7.6,0,14.55,1.1,20.85,3.3,6.3,2.2,11.85,5.25,16.65,9.15,4.8,3.9,8.9,8.4,12.3,13.5,3.4,5.1,5.9,10.55,7.5,16.35l-9.9-1.2v-37.8h47.7v159.3h-48.6v-38.4l10.8-.3c-1.6,5.6-4.2,10.9-7.8,15.9-3.6,5-8,9.4-13.2,13.2-5.2,3.8-11,6.8-17.4,9-6.4,2.2-13.2,3.3-20.4,3.3ZM144.23,317.8c7.4,0,13.8-1.7,19.2-5.1,5.4-3.4,9.6-8.25,12.6-14.55s4.5-13.75,4.5-22.35-1.5-16.05-4.5-22.35c-3-6.3-7.2-11.2-12.6-14.7-5.4-3.5-11.8-5.25-19.2-5.25s-13.45,1.75-18.75,5.25c-5.3,3.5-9.45,8.4-12.45,14.7-3,6.3-4.5,13.75-4.5,22.35s1.5,16.05,4.5,22.35,7.15,11.15,12.45,14.55c5.3,3.4,11.55,5.1,18.75,5.1Z"/>
									<path d="M342.83,424.6c-13,0-25.95-1.9-38.85-5.7-12.9-3.8-23.35-8.7-31.35-14.7l16.8-33.6c4.2,2.8,8.85,5.25,13.95,7.35,5.1,2.1,10.45,3.75,16.05,4.95,5.6,1.2,11.3,1.8,17.1,1.8,10.2,0,18.5-1.5,24.9-4.5,6.4-3,11.2-7.55,14.4-13.65,3.2-6.1,4.8-13.75,4.8-22.95v-26.7l9.3,1.5c-1.4,6.6-4.85,12.6-10.35,18-5.5,5.4-12.25,9.75-20.25,13.05-8,3.3-16.5,4.95-25.5,4.95-14.4,0-27.25-3.35-38.55-10.05-11.3-6.7-20.2-16-26.7-27.9-6.5-11.9-9.75-25.65-9.75-41.25s3.2-30.15,9.6-42.45c6.4-12.3,15.2-22,26.4-29.1,11.2-7.1,23.8-10.65,37.8-10.65,6,0,11.75.7,17.25,2.1,5.5,1.4,10.6,3.25,15.3,5.55,4.7,2.3,8.9,5,12.6,8.1,3.7,3.1,6.7,6.45,9,10.05,2.3,3.6,3.85,7.3,4.65,11.1l-9.9,2.4,1.8-36h45.6v146.4c0,13-1.95,24.55-5.85,34.65-3.9,10.1-9.6,18.7-17.1,25.8-7.5,7.1-16.55,12.45-27.15,16.05-10.6,3.6-22.6,5.4-36,5.4ZM344.03,317.2c7.8,0,14.55-1.75,20.25-5.25,5.7-3.5,10.1-8.35,13.2-14.55,3.1-6.2,4.65-13.5,4.65-21.9s-1.55-15.75-4.65-22.05c-3.1-6.3-7.5-11.2-13.2-14.7-5.7-3.5-12.45-5.25-20.25-5.25s-14.2,1.75-19.8,5.25c-5.6,3.5-9.95,8.4-13.05,14.7-3.1,6.3-4.65,13.65-4.65,22.05s1.55,15.7,4.65,21.9c3.1,6.2,7.45,11.05,13.05,14.55,5.6,3.5,12.2,5.25,19.8,5.25Z"/>
								</svg>
							</InputButton>
							<InputButton bind:settingsProp={$settings.textTransform} value="none">
								<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 500 500">
									<path d="M46.88,355.6l83.1-210h43.2l82.5,210h-51.6l-39.6-106.5c-1.6-4.2-3.2-8.7-4.8-13.5-1.6-4.8-3.2-9.75-4.8-14.85-1.6-5.1-3.15-10.1-4.65-15-1.5-4.9-2.75-9.45-3.75-13.65l9-.3c-1.2,5-2.55,9.9-4.05,14.7-1.5,4.8-3,9.55-4.5,14.25-1.5,4.7-3.15,9.4-4.95,14.1-1.8,4.7-3.5,9.55-5.1,14.55l-39.6,106.2h-50.4ZM86.48,315.4l15.9-38.4h96.6l15.6,38.4H86.48Z"/>
									<path d="M346.58,424.6c-13,0-25.95-1.9-38.85-5.7-12.9-3.8-23.35-8.7-31.35-14.7l16.8-33.6c4.2,2.8,8.85,5.25,13.95,7.35,5.1,2.1,10.45,3.75,16.05,4.95,5.6,1.2,11.3,1.8,17.1,1.8,10.2,0,18.5-1.5,24.9-4.5,6.4-3,11.2-7.55,14.4-13.65,3.2-6.1,4.8-13.75,4.8-22.95v-26.7l9.3,1.5c-1.4,6.6-4.85,12.6-10.35,18-5.5,5.4-12.25,9.75-20.25,13.05-8,3.3-16.5,4.95-25.5,4.95-14.4,0-27.25-3.35-38.55-10.05-11.3-6.7-20.2-16-26.7-27.9-6.5-11.9-9.75-25.65-9.75-41.25s3.2-30.15,9.6-42.45c6.4-12.3,15.2-22,26.4-29.1,11.2-7.1,23.8-10.65,37.8-10.65,6,0,11.75.7,17.25,2.1,5.5,1.4,10.6,3.25,15.3,5.55,4.7,2.3,8.9,5,12.6,8.1,3.7,3.1,6.7,6.45,9,10.05,2.3,3.6,3.85,7.3,4.65,11.1l-9.9,2.4,1.8-36h45.6v146.4c0,13-1.95,24.55-5.85,34.65-3.9,10.1-9.6,18.7-17.1,25.8-7.5,7.1-16.55,12.45-27.15,16.05-10.6,3.6-22.6,5.4-36,5.4ZM347.78,317.2c7.8,0,14.55-1.75,20.25-5.25,5.7-3.5,10.1-8.35,13.2-14.55,3.1-6.2,4.65-13.5,4.65-21.9s-1.55-15.75-4.65-22.05c-3.1-6.3-7.5-11.2-13.2-14.7-5.7-3.5-12.45-5.25-20.25-5.25s-14.2,1.75-19.8,5.25c-5.6,3.5-9.95,8.4-13.05,14.7-3.1,6.3-4.65,13.65-4.65,22.05s1.55,15.7,4.65,21.9c3.1,6.2,7.45,11.05,13.05,14.55,5.6,3.5,12.2,5.25,19.8,5.25Z"/>
								</svg>
							</InputButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>