
<script lang="ts">
	import { finalCaptions, partialCaptions } from "../lib/captions";
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
		$position.left = 20;
		//$position.left = 50 - movableElem.offsetWidth * 50 / movableArea.offsetWidth;
	}

	function onMouseDown(e: MouseEvent) {
		if( !$settings.positionLocked ) {
			moving = true;
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
	}
	
	function onMouseMove(e: MouseEvent) {
		if (moving) {
			const deltaX = mouseX - e.clientX;
			const deltaY = mouseY - e.clientY;

			// Update position
			$position.bottom = $position.bottom! + (deltaY * 100 / movableArea.offsetHeight);
			$position.left = $position.left! - (deltaX * 100 / movableArea.offsetWidth);

			// Get area limits
			const areaRect = movableArea.getBoundingClientRect();
			const elemRect = movableElem.getBoundingClientRect();
			const maxBottom = 100 - elemRect.height * 100 / areaRect.height;
			const maxLeft = 100 - elemRect.width * 100 / areaRect.width;

			// Limit captions in area
			$position.bottom = Math.max(0, Math.min($position.bottom, maxBottom));
			$position.left = Math.max(0, Math.min($position.left, maxLeft));

			// Ignore delta if on borders
			if($position.left!==0 && $position.left!==maxLeft) mouseX = e.clientX;
			if($position.bottom!==0 && $position.bottom!==maxBottom) mouseY = e.clientY;
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

{#if settingsShown || $partialCaptions || $finalCaptions }
	<div id="caption-movable-area" bind:this={movableArea}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id="caption-container"
			style={ getCaptionsStyle($settings) }
			style:bottom = { $position.bottom + '%' } 
			style:left = { $position.left + '%' }
			on:mousedown={ onMouseDown }
			bind:this={ movableElem }
			class:locked={ $settings.positionLocked }
		>
			<div class="caption-content-box" style="max-height: calc(1.25em * { $settings.maxLines });">
				<p id="caption-content">
					<span id="finished-content">
						{#if $finalCaptions }
							{ $finalCaptions }
						{:else if !$partialCaptions }
							This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption
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