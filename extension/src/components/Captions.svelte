<script lang="ts">
    import { fade } from "svelte/transition";
	import { partialCaptions, transcript } from "../lib/captions";
	import { position, settings, language, type SettingsType } from "../lib/settings";
	import { hexToRGB } from "../lib/utils";

	export let settingsShown: boolean;

	let movableArea: HTMLElement;
	let movableElem: HTMLElement;

	let resizing = false;
	let moving = false;
	let mouseX: number;
	let mouseY: number;

	export let captionHovered: boolean = false;

	function startResize(e: MouseEvent) {
		if(!$position.locked && !e.defaultPrevented) {
			resizing = true;
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
	}

	function onMouseDown(e: MouseEvent) {
		if(!$position.locked && !e.defaultPrevented) {
			moving = true;
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
	}

	// Ensure captions are in view after settings are changed
	$: if(movableArea && movableElem && $settings) clampCaptions();

	function clampCaptions() {
		// Half height/width in percent to calc limits
		const halfHeight = movableElem.offsetHeight * 50 / movableArea.offsetHeight;
		const halfWidth = movableElem.offsetWidth * 50 / movableArea.offsetWidth;
		
		// Limits
		const minBottom = 0 + halfHeight;
		const maxBottom = 100 - halfHeight;
		const minLeft = 0 + halfWidth;
		const maxLeft = 100 - halfWidth;
		
		const minWidth = 15;
		const maxWidth = 100;

		// Round all values
		$position.bottom = Math.round($position.bottom * 1000) / 1000;
		$position.left = Math.round($position.left * 1000) / 1000;
		$position.width = Math.round($position.width * 1000) / 1000;

		// Position limits
		$position.bottom = Math.max(minBottom, Math.min($position.bottom, maxBottom));
		$position.left = Math.max(minLeft, Math.min($position.left, maxLeft));
		$position.width = Math.max(minWidth, Math.min($position.width, maxWidth));

		// Return true for each side where captions are at limit
		return {
			top: $position.bottom === maxBottom,
			bottom: $position.bottom === minBottom,
			left: $position.left === minLeft,
			right: $position.left === maxLeft,
			minWidth: $position.width === minWidth,
			maxWidth: $position.width === maxWidth
		}
	}

	async function onMouseMove(e: MouseEvent) {
		const deltaX = mouseX - e.clientX;
		const deltaY = mouseY - e.clientY;

		if(resizing) {
			// Height limits
			const minHeight = 1;
			const maxHeight = 20;

			// Update size
			const oldWith = $position.width;
			const oldLeft = $position.left;

			// Update width
			$position.width -= (deltaX / movableArea.offsetWidth) * 100;
			
			// Update height
			let newMaxLines = Math.round($position.maxLines - deltaY / (1.5 * $settings.fontSize))
			newMaxLines = Math.max(minHeight, Math.min(newMaxLines, maxHeight));
			if(newMaxLines !== $position.maxLines) { // If we changed maxLines
				$position.maxLines = newMaxLines;
				mouseY = e.clientY;
			}

			// Update position
			$position.left -= (deltaX / movableArea.offsetWidth) * 100 /2;

			const sides = clampCaptions();

			if(!sides.minWidth && !sides.maxWidth) {
				mouseX = e.clientX;
			}else{
				$position.left = oldLeft;
				$position.width = oldWith;
			}

		}else if (moving) {
			// Update position
			$position.bottom += (deltaY * 100 / movableArea.offsetHeight);
			$position.left -= (deltaX * 100 / movableArea.offsetWidth);

			// Clamp captions into area
			const sides = clampCaptions();
			
			// Ignore delta if on borders
			if(!sides.top && !sides.bottom) mouseY = e.clientY;
			if(!sides.left && !sides.right) mouseX = e.clientX;
		}
	}

	function onMouseUp() {
		moving = false;
		resizing = false;
	}

	function onMouseEnter() {
		captionHovered = true;
	}

	function onMouseLeave() {
		captionHovered = false;
	}

	// Get style rule to apply to captions container
	function getCaptionsStyle(settings: SettingsType) {
		return 'color: ' + settings.textColor + ';'
		+ 'font-size: ' + settings.fontSize + 'px;'
		+ 'font-family: ' + settings.fontFamily + ';'
		+ 'background-color: rgba(' + hexToRGB(settings.backgroundColor) + ', ' + settings.backgroundOpacity/100 + ');'
		+ 'backdrop-filter: blur(' + (settings.backgroundOpacity / 10) + 'px) ;';
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
			style:width = { $position.width + '%' }
			on:mousedown={ onMouseDown }
			on:mouseenter={ onMouseEnter }
			on:mouseleave={ onMouseLeave }
			on:click|preventDefault
			bind:this={ movableElem }
			class:locked={ $position.locked }
			transition:fade={ { duration: 100 } }
		>
			<div class="caption-content-box" style="max-height: calc(1.25em * { $position.maxLines });">
				<!-- Show only if caption is hover -->
				{#if !$position.locked && captionHovered}
					<div class="resize-control"
						on:mousedown = { startResize }
						transition:fade={ { duration: 100 } }
					>
						<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M21 15L15 21M21 8L8 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
				{/if}
				<p>
					{#if $transcript.length }
						{#each $transcript as line, i }
							{#if i!==0}
								<br/>
							{/if}
							{ ( line.find(alt=>alt.lang === $language) ?? line[0] ).text } 
						{/each}
					{:else if !$partialCaptions }
						This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption This is a sample caption
					{/if}
					{#if $partialCaptions}
						{#if $transcript.length}
							<br/>
						{/if}
						{ $partialCaptions }
					{/if}
				</p>
			</div>
		</div>
	</div>
{/if}

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />
