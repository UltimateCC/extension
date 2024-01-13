<script lang="ts">
    import { fade } from "svelte/transition";
	import { partialCaptions, transcript } from "../lib/captions";
	import { position, settings, language, type SettingsType } from "../lib/settings";
	import { hexToRGB } from "../lib/utils";

	export let settingsShown: boolean;
	export let captionHovered: boolean = false;
	const LINE_HEIGHT = 1.25; // Size of one line in em (same as line-height in css)
	const MAX_LINES = 50; // Max lines to show in captions
	
	const lineHeightPx = LINE_HEIGHT * $settings.fontSize;

	let movableArea: HTMLElement;
	let movableElem: HTMLElement;

	/** Resizing with size and angle <=>
	 * t: top, b: bottom, l: left, r: right
	 * tl: top left, tr: top right, bl: bottom left, br: bottom right
	*/
	let resizing = "";
	let moving = false;
	let mouseX: number;
	let mouseY: number;

	function startResizing(sideOrAngle: string, e: MouseEvent) {
		if(!$position.locked && !e.defaultPrevented) {
			resizing = sideOrAngle;
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
	}

	function startMoving(e: MouseEvent) {
		if(!$position.locked && !e.defaultPrevented) {
			moving = true;
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
	}

	// Ensure captions are in view after settings are changed
	$: if(movableArea?.offsetHeight && movableElem?.offsetHeight && $settings) clampCaptions();

	function clampCaptions() {
		// Height/width in percent to calc limits
		const height = movableElem.offsetHeight * 100 / movableArea.offsetHeight;
		const width = movableElem.offsetWidth * 100 / movableArea.offsetWidth;

		// Limits
		const minTop = 0;
		const maxTop = 100 - height;
		const minLeft = 0;
		const maxLeft = 100 - width;

		const minWidth = 15;
		const maxWidth = 100;
		const minHeight = 1;
		const maxHeight = Math.min(Math.floor(movableArea.offsetHeight / lineHeightPx) - 4, MAX_LINES);

		// Round all values (except maxLines)
		$position.top = Math.round($position.top * 1000) / 1000;
		$position.left = Math.round($position.left * 1000) / 1000;
		$position.width = Math.round($position.width * 1000) / 1000;

		// Position limits
		$position.top = Math.max(minTop, Math.min($position.top, maxTop));
		$position.left = Math.max(minLeft, Math.min($position.left, maxLeft));
		$position.width = Math.max(minWidth, Math.min($position.width, maxWidth));
		$position.maxLines = Math.max(minHeight, Math.min($position.maxLines, maxHeight));

		// Return true for each side where captions are at limit
		return {
			top: $position.top === minTop,
			bottom: $position.top === maxTop,
			left: $position.left === minLeft,
			right: $position.left === maxLeft,
			minWidth: $position.width === minWidth,
			maxWidth: $position.width === maxWidth,
			minHeight: $position.maxLines === minHeight,
			maxHeight: $position.maxLines === maxHeight,
		}
	}

	async function onMouseMove(e: MouseEvent) {
		const deltaX = mouseX - e.clientX;
		const deltaY = mouseY - e.clientY;

		if(resizing) {
			// Update sizes
			if (resizing !== ("t" && "b")) { // Update width
				let newWidth = (deltaX / movableArea.offsetWidth) * 100;
				if (resizing.includes("l")) { // If we're resizing left side, we need to update left position and width
					$position.left -= (deltaX * 100 / movableArea.offsetWidth);
					newWidth *= -1; // Reverse delta
				} 

				$position.width -= newWidth;
			}

			if (resizing !== ("l" && "r")) { // Update height
				let newHeight = deltaY / (LINE_HEIGHT * $settings.fontSize);
				if (resizing.includes("t")) newHeight *= -1; // If we're resizing top side we reverse delta

				const oldLines = Math.round($position.maxLines);
				$position.maxLines -= newHeight;

				// Only update top position if we're resizing top side and maxLines rounded changed
				if(resizing.includes("t") && oldLines !== Math.round($position.maxLines)) {
					const lineHeightPercent = lineHeightPx * 100 / movableArea.offsetHeight;
					$position.top -= Math.sign(deltaY) * lineHeightPercent; 
				}
			}

			// Limit to borders
			const sides = clampCaptions();

			// Ignore delta if on borders
			if(!sides.minWidth && !sides.maxWidth) mouseX = e.clientX;
			if(!sides.maxHeight && !sides.minHeight) mouseY = e.clientY;

		}else if (moving) {
			// Update position
			$position.top -= (deltaY * 100 / movableArea.offsetHeight);
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
		resizing = "";
		$position.maxLines = Math.round($position.maxLines);
	}

	function onMouseEnter() {
		captionHovered = true;
	}

	function onMouseLeave() {
		captionHovered = false;
	}

	// Set style root variable to apply in css on settings change
	$: {
		document.documentElement.style.setProperty('--captions-text-color', $settings.textColor);
		document.documentElement.style.setProperty('--captions-font-size', $settings.fontSize + 'px');
		document.documentElement.style.setProperty('--captions-font-family', $settings.fontFamily);
		document.documentElement.style.setProperty('--captions-background-color', 'rgba(' + hexToRGB($settings.backgroundColor) + ', ' + $settings.backgroundOpacity/100 + ')');
		document.documentElement.style.setProperty('--captions-background-opacity', ($settings.backgroundOpacity / 10) + 'px');
	}

	$: textHeight = LINE_HEIGHT + "em *" + Math.round($position.maxLines);
</script>

{#if settingsShown || $partialCaptions || $transcript.length }
	<div id="caption-movable-area" bind:this={movableArea}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div id="caption-container" 
			style:top = { $position.top + '%' } 
			style:left = { $position.left + '%' }
			style:width = { $position.width + '%' }
			style:height = "calc(0.5em + { textHeight })"
			on:mousedown={ startMoving }
			on:mouseenter={ onMouseEnter }
			on:mouseleave={ onMouseLeave }
			on:click|preventDefault
			bind:this={ movableElem }
			class:locked={ $position.locked }
			transition:fade={ { duration: 100 } }
		>
			<div class="caption-container-box">
				<div class="caption-content-box" style="max-height: calc({ textHeight });">
					<!-- Resize control shown only on hover -->
					{#if !$position.locked && (captionHovered || resizing)}
						<div class="resize-angle-br"
							aria-label="Resize captions (bottom right)"
							on:mousedown = { (e) => startResizing("br", e) }
							transition:fade={ { duration: 200 } }
						>
							<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M21 15L15 21M21 8L8 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<div class="resize-angle-bl" aria-label="Resize captions (bottom left)" on:mousedown = { (e) => startResizing("bl", e) }></div>
						<div class="resize-angle-tl" aria-label="Resize captions (top left)" on:mousedown = { (e) => startResizing("tl", e) } ></div>
						<div class="resize-angle-tr" aria-label="Resize captions (top right)" on:mousedown = { (e) => startResizing("tr", e) }></div>
					
						<div class="resize-side-t" aria-label="Resize captions (top)" on:mousedown = { (e) => startResizing("t", e) }></div>
						<div class="resize-side-r" aria-label="Resize captions (right)" on:mousedown = { (e) => startResizing("r", e) }></div>
						<div class="resize-side-b" aria-label="Resize captions (bottom)" on:mousedown = { (e) => startResizing("b", e) }></div>
						<div class="resize-side-l" aria-label="Resize captions (left)" on:mousedown = { (e) => startResizing("l", e) }></div>
					{/if}
					<p>
						{#if $transcript.length < MAX_LINES && (resizing || settingsShown)}
							{#each {length: MAX_LINES - $transcript.length} as _}
								This is a sample caption to show you how it looks like <br/>
							{/each}
						{/if}
						
						{#each $transcript as line, i }
							{#if i!==0}
								<br/>
							{/if}
							{ ( line.find(alt=>alt.lang === $language) ?? line[0] ).text } 
						{/each}
						
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
	</div>
{/if}

<style lang="scss">
	@import '../assets/vars.scss';

	$angle-pos: -0.3em;
	$angle-size: 1.5em;
	$angle-polygon-size: 70%;

	$square-pos: -0.3em;
	$square-size: 0.5em;


	div[class*="resize-"] {
		position: absolute;
		font-size: 1.25em;
		
		&[class*="resize-angle"] {
			width: $angle-size;
			height: $angle-size;
			
			&.resize-angle-br {
				cursor: nwse-resize;
				bottom: $angle-pos;
				right: $angle-pos;
				
				clip-path: polygon($angle-polygon-size 0, 100% 0, 100% 100%, 0 100%, 0 $angle-polygon-size);
				transition: transform 0.2s ease-in-out;

				svg {
					font-size: 0.95em;
					clip-path: polygon(100% 0, 0% 100%, 100% 100%);
				}

				svg > * {
					stroke: $settings-text-color;
				}
			}

			&.resize-angle-bl {
				cursor: nesw-resize;
				bottom: $angle-pos;
				left: $angle-pos;
				
				clip-path: polygon((100% - $angle-polygon-size) 0, 100% $angle-polygon-size, 100% 100%, 0 100%, 0 0);
			}

			&.resize-angle-tl {
				cursor: nwse-resize;
				top: $angle-pos;
				left: $angle-pos;
				
				clip-path: polygon(0 0, 100% 0, 100% (100% - $angle-polygon-size), (100% - $angle-polygon-size) 100%, 0 100%);
			}

			&.resize-angle-tr {
				cursor: nesw-resize;
				top: $angle-pos;
				right: $angle-pos;
				
				clip-path: polygon(0 0, 100% 0, 100% 100%, $angle-polygon-size 100%, 0 (100% - $angle-polygon-size));
			}
		}

		&[class*="resize-side"] {
			width: $square-size;
			height: $square-size;

			&.resize-side-t, &.resize-side-b {
				width: calc(100% - 2*$angle-size - 2*$angle-pos);
				left: calc($angle-pos + $angle-size);
			}

			&.resize-side-t {
				cursor: ns-resize;
				top: $square-pos;
			}

			&.resize-side-b {
				cursor: ns-resize;
				bottom: $square-pos;
			}


			&.resize-side-r, &.resize-side-l {
				height: calc(100% - 2*$angle-size - 2*$angle-pos);
				top: calc($angle-pos + $angle-size);
			}

			&.resize-side-r {
				cursor: ew-resize;
				right: $square-pos;
			}

			&.resize-side-l {
				cursor: ew-resize;
				left: $square-pos;
			}
		}
	}
</style>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

