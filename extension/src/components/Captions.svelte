<script lang="ts">
    import { fade } from "svelte/transition";
	import { transcript } from "../lib/captions";
	import { position, settings, language } from "../lib/settings";
	import { hexToRGB } from "../lib/utils";

	export let settingsShown: boolean;
	export let captionHovered: boolean = false;
	const LINE_HEIGHT = 1.25; // Size of one line in em (same as line-height in css)
	const MAX_LINES = 50; // Max lines to show in captions
	$: lineHeightPx = LINE_HEIGHT * $settings.fontSize;

	let movableArea: HTMLElement;
	let movableElem: HTMLElement;

	/** Resizing with size and angle <=>
	 * t: top, b: bottom, l: left, r: right
	 * tl: top left, tr: top right, bl: bottom left, br: bottom right
	*/
	let resizing: string;
	let moving = false;
	let mouseX: number;
	let mouseY: number;

	function startResizing(sideOrAngle: string, e: MouseEvent) {
		if(startMoveResize(e)) {
			resizing = sideOrAngle;
		}
	}

	function startMoving(e: MouseEvent) {
		if(startMoveResize(e)) {
			moving = true;
		}
	}

	function startMoveResize(e: MouseEvent) {
		if(!$position.locked && !e.defaultPrevented) {
			mouseX = e.clientX;
			mouseY = e.clientY;
			return true;
		}
		return false;
	}

	// Ensure captions are in view after settings are changed
	$: if(movableArea?.offsetHeight && movableElem?.offsetHeight && $settings) {
		clampPosition();
	}

	function clampPosition() {
		// Height/width in percent to calc limits
		const height = movableElem.offsetHeight * 100 / movableArea.offsetHeight;
		const width = movableElem.offsetWidth * 100 / movableArea.offsetWidth;

		// Limits
		const minTop = 0;
		const maxTop = 100 - height;
		const minLeft = 0;
		const maxLeft = 100 - width;
		const maxHeight = Math.floor(movableArea.offsetHeight / lineHeightPx - .25);

		// Round all values (except maxLines)
		$position.bottom = Math.round($position.bottom * 1000) / 1000;
		$position.left = Math.round($position.left * 1000) / 1000;
		$position.width = Math.round($position.width * 1000) / 1000;

		// Height limit
		$position.maxLines = Math.min($position.maxLines, maxHeight);

		// Position limits
		$position.bottom = Math.max(minTop, Math.min($position.bottom, maxTop));
		$position.left = Math.max(minLeft, Math.min($position.left, maxLeft));

		// Return true for each side where captions are at limit
		return {
			top: $position.bottom === minTop,
			bottom: $position.bottom === maxTop,
			left: $position.left === minLeft,
			right: $position.left === maxLeft,
		}
	}

	async function onMouseMove(e: MouseEvent) {
		const deltaX = mouseX - e.clientX;
		const deltaY = mouseY - e.clientY;

		// Update sizes
		if(resizing) {
			// Update width
			if (resizing !== "t" && resizing !== "b") {
				const oldWidth = $position.width;

				// Width limits
				const minWidth = 15;
				let maxWidth;
				if(resizing.includes('l')) {
					maxWidth = $position.left + oldWidth;
				}else{
					maxWidth = 100 - $position.left;
				}

				// Calc new width
				const sign = resizing.includes("l") ? -1 : 1; // Sign of delta
				$position.width -= sign * deltaX * 100 / movableArea.offsetWidth;
				$position.width = Math.max(minWidth, Math.min($position.width, maxWidth));

				if($position.width !== minWidth && $position.width !== maxWidth) {
					mouseX = e.clientX;
				}

				// If resizing from left, adapt position accordingly
				if (resizing.includes("l")) {
					$position.left += oldWidth - $position.width;
				}
			}

			// Update height
			if (resizing !== "l" && resizing !== "r") { 
				const oldLines = Math.round($position.maxLines);

				// Height limits
				const minHeight = 1;
				let maxHeight;
				if(resizing.includes('b')) {
					maxHeight = Math.floor($position.bottom / 100 * movableArea.offsetHeight / lineHeightPx + oldLines);
				}else{
					maxHeight = Math.floor((100 - $position.bottom) / 100 * movableArea.offsetHeight / lineHeightPx - .25);
				}
				maxHeight = Math.min(maxHeight, MAX_LINES);
				
				// Calc new height
				const sign = resizing.includes("t") ? -1 : 1; // Sign of delta
				$position.maxLines -= sign * deltaY / (LINE_HEIGHT * $settings.fontSize);
				$position.maxLines = Math.max(minHeight, Math.min($position.maxLines, maxHeight));
				
				if($position.maxLines !== minHeight && $position.maxLines !== maxHeight) {
					mouseY = e.clientY;
				}

				// If resizing from bottom: Adapt position from line count difference
				if(resizing.includes("b")) {
					const linesDelta = oldLines - Math.round($position.maxLines);
					// Move position only if actually changed
					if(linesDelta !== 0) {
						const lineHeightPercent = lineHeightPx * 100 / movableArea.offsetHeight;
						$position.bottom += linesDelta * lineHeightPercent;						
					}
				}
			}
		}else if (moving) {
			// Update position
			$position.bottom += (deltaY * 100 / movableArea.offsetHeight);
			$position.left -= (deltaX * 100 / movableArea.offsetWidth);

			// Clamp captions into area
			const sides = clampPosition();

			// Ignore delta if on borders
			if(!sides.top && !sides.bottom) mouseY = e.clientY;
			if(!sides.left && !sides.right) mouseX = e.clientX;
		}
	}

	function onMouseUp() {
		moving = false;
		resizing = '';
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

	const ALL_SIDES = ["top", "bottom", "left", "right"];
	const ALL_ANGLES = ["top left", "top right", "bottom left", "bottom right"];

	$: textHeight = LINE_HEIGHT + "em *" + Math.round($position.maxLines);

</script>

{#if settingsShown || $transcript.length }
	{@const mustShowEmptyBox = $transcript.length < $position.maxLines && !resizing && !settingsShown && (captionHovered || moving) }
	<div id="caption-movable-area" bind:this={movableArea} data-resize-side={ resizing ?? "" }>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div id="caption-container" 
			style:bottom = { $position.bottom + '%' } 
			style:left = { $position.left + '%' }
			style:width = { $position.width + '%' }
			style:height = "calc(0.5em + { textHeight })"
			on:mousedown={ startMoving }
			on:mouseenter={ onMouseEnter }
			on:mouseleave={ onMouseLeave }
			on:click|preventDefault
			bind:this={ movableElem }
			class:locked={ $position.locked }
			class:have-empty-box={ mustShowEmptyBox }
			transition:fade={ { duration: 100 } }
		>
			<!-- Resize control shown only on hover -->
			{#if !$position.locked && (captionHovered || resizing)}
				<div class="resize-container" transition:fade={ { duration: 100 } }>
					{#each ALL_ANGLES as side}
						{@const acronym = side.split(' ').map(s=>s[0]).join('') }
						<div 
							class={"resize-angle-" + acronym}
							aria-label={"Resize captions (" + side + ")"}
							on:mousedown = { (e) => startResizing(acronym, e) }
						>
							{#if acronym === "br"}
								<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M21 15L15 21M21 8L8 21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							{/if}
						</div>
					{/each}

					{#each ALL_SIDES as side}
						<div 
							class={"resize-side-" + side[0]}
							aria-label={"Resize captions (" + side + ")"}
							on:mousedown = { (e) => startResizing(side[0], e) }
						>
						</div>
					{/each}
				</div>
			{/if}
			<div class="caption-container-box">
				<div class="caption-content-box" style="max-height: calc({ textHeight });">
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
							{#if line[0]?.speaker}
								<b>{line[0].speaker}: </b>
							{/if}
							{#each line as part }
								{ ( part.captions.find(alt=>alt.lang === $language) ?? part.captions[0] ).text }
							{/each}
						{/each}
					</p>
				</div>
			</div>
			{#if mustShowEmptyBox}
				<div class="empty-box" transition:fade={ { duration: 150 } }></div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	$angle-pos: -0.3em;
	$angle-svg-pos: 0.25em;
	$angle-size: 1.5em;
	$angle-polygon-size: 70%;

	$square-pos: -0.3em;
	$square-size: 0.5em;

	$side-cursor: (
		t: ns-resize,
		b: ns-resize,
		l: ew-resize,
		r: ew-resize,
		tl: nwse-resize,
		tr: nesw-resize,
		bl: nesw-resize,
		br: nwse-resize,
	);

	#caption-movable-area {
		@each $side, $cursor in $side-cursor {
			&[data-resize-side="#{$side}"] {
				cursor: $cursor !important;
			}
		}

		&:not([data-resize-side=""]) #caption-container {
			cursor: inherit !important;
			
			.resize-container div[class*="resize-"] {
				cursor: inherit !important;
			}
		}
	}

	.caption-container-box {
		z-index: 5;
	}

	.resize-container {
		z-index: 9;

		div[class*="resize-"] {
			position: absolute;
			font-size: 1.25em;
			
			&[class*="resize-angle"] {
				width: $angle-size;
				height: $angle-size;

				svg {
					font-size: 0.95em;
					position: absolute;
					clip-path: polygon(100% 0, 0% 100%, 100% 100%);
				
					& > * {
						stroke: var(--captions-text-color);
					}
				}

				&.resize-angle-br {
					cursor: nwse-resize;
					bottom: $angle-pos;
					right: $angle-pos;
					
					clip-path: polygon($angle-polygon-size 0, 100% 0, 100% 100%, 0 100%, 0 $angle-polygon-size);
				
					svg {
						top: $angle-svg-pos;
						left: $angle-svg-pos;
					}
				}

				&.resize-angle-bl {
					cursor: nesw-resize;
					bottom: $angle-pos;
					left: $angle-pos;
					
					clip-path: polygon((100% - $angle-polygon-size) 0, 100% $angle-polygon-size, 100% 100%, 0 100%, 0 0);

					svg {
						transform: rotate(90deg);
						top: $angle-svg-pos;
						right: $angle-svg-pos;
					}
				}

				&.resize-angle-tl {
					cursor: nwse-resize;
					top: $angle-pos;
					left: $angle-pos;
					
					clip-path: polygon(0 0, 100% 0, 100% (100% - $angle-polygon-size), (100% - $angle-polygon-size) 100%, 0 100%);
					
					svg {
						transform: rotate(180deg);
						bottom: $angle-svg-pos;
						right: $angle-svg-pos;
					}
				}

				&.resize-angle-tr {
					cursor: nesw-resize;
					top: $angle-pos;
					right: $angle-pos;
					
					clip-path: polygon(0 0, 100% 0, 100% 100%, $angle-polygon-size 100%, 0 (100% - $angle-polygon-size));
					
					svg {
						transform: rotate(-90deg);
						bottom: $angle-svg-pos;
						left: $angle-svg-pos;
					}
				}
			}

			&[class*="resize-side"] {
				width: $square-size;
				height: $square-size;
				// background-color: rgba(255,255,255,0.5);

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
	}

</style>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

