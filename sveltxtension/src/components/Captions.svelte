
<script lang="ts">
    import { fade } from "svelte/transition";
	import { partialCaptions, transcript } from "../lib/captions";
	import { position, settings, type SettingsType } from "../lib/settings";
	import { hexToRGB } from "../lib/utils";

	export let settingsShown: boolean;

	let movableArea: HTMLElement;
	let movableElem: HTMLElement;

	let moving = false;
	let mouseX: number;
	let mouseY: number;

	// Set initial position
	$: if($position.bottom === undefined && movableArea && movableElem) {
		$position.bottom = 10;
	}
	$: if($position.left === undefined && movableArea && movableElem) {
		$position.left = 50;
	}

	function onMouseDown(e: MouseEvent) {
		if( !$position.locked && !e.defaultPrevented ) {
			moving = true;
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
	}

	function clampCaptions() {
		// Get area limits
		const areaRect = movableArea.getBoundingClientRect();
		const elemRect = movableElem.getBoundingClientRect();

		// Half height/width in percent
		const halfHeight = elemRect.height * 50 / areaRect.height;
		const halfWidth = elemRect.width * 50 / areaRect.width;
		// Calc limits
		const minBottom = 0 + halfHeight;
		const maxBottom = 100 - halfHeight;
		const minLeft = 0 + halfWidth;
		const maxLeft = 100 - halfWidth;

		// Limit captions in area
		$position.bottom = Math.max(minBottom, Math.min($position.bottom!, maxBottom));
		$position.left = Math.max(minLeft, Math.min($position.left!, maxLeft));

		// Return true for each side where captions are at limit
		return {
			top: $position.bottom === maxBottom,
			bottom: $position.bottom === minBottom,
			left: $position.left === minLeft,
			right: $position.left === maxLeft
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (moving) {
			const deltaX = mouseX - e.clientX;
			const deltaY = mouseY - e.clientY;

			// Update position
			$position.bottom = $position.bottom! + (deltaY * 100 / movableArea.offsetHeight);
			$position.left = $position.left! - (deltaX * 100 / movableArea.offsetWidth);

			// Clamp captions into area
			const sides = clampCaptions();

			// Ignore delta if on borders
			if(!sides.top && !sides.bottom) mouseY = e.clientY;
			if(!sides.left && !sides.right) mouseX = e.clientX;
		}
	}

	function onMouseUp() {
		moving = false;
	}

	// Get style rule to apply to captions container
	function getCaptionsStyle(settings: SettingsType) {
		return 'color: ' + settings.textColor + ';'
		+ 'font-size: ' + settings.fontSize + 'px;'
		+ 'font-family: ' + settings.fontFamily + ';'
		+ 'background-color: rgba(' + hexToRGB(settings.backgroundColor) + ', ' + settings.backgroundOpacity/100 + ');'
		+ 'backdrop-filter: blur(' + (settings.backgroundOpacity / 10) + 'px) ;'
	}
</script>

{#if settingsShown || $partialCaptions || $transcript.length }
	<div id="caption-movable-area" bind:this={movableArea}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div id="caption-container"
			style={ getCaptionsStyle($settings) }
			style:bottom = { $position.bottom + '%' } 
			style:left = { $position.left + '%' }
			on:mousedown={ onMouseDown }
			on:click|preventDefault
			bind:this={ movableElem }
			class:locked={ $position.locked }
			transition:fade={ { duration: 100 } }
		>
			<div class="caption-content-box" style="max-height: calc(1.25em * { $settings.maxLines });">
				<p id="caption-content">
					<span id="finished-content">
						{#if $transcript.length }
							{#each $transcript as line }
								{ ( line.find(alt=>alt.lang === $settings.language) ?? line[0] ).text }
							{/each}
						{:else if !$partialCaptions }
							This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption
						{/if}
					</span>
					<span id="unfinished-content">
						{ $partialCaptions }
					</span>
				</p>
			</div>
		</div>
	</div>
{/if}

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />