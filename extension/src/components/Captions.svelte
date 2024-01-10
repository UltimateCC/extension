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
	$: if(movableArea?.offsetHeight && movableElem?.offsetHeight && $settings) clampCaptions();

	function clampCaptions() {
		// Half height/width in percent to calc limits
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
		const maxHeight = 20;

		// Round all values
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
			// Get sizes
			const oldWidth = $position.width;
			const oldMaxLines = $position.maxLines;

			// Update sizes
			$position.width -= (deltaX / movableArea.offsetWidth) * 100;
			$position.maxLines -= deltaY / ( 1.25 * $settings.fontSize);

			// Limit to borders
			const sides = clampCaptions();

			// Cancel update if on limits
			if(!sides.maxHeight && !sides.minHeight) {
				mouseY = e.clientY;
			}else{
				$position.maxLines = oldMaxLines;
			}

			if(!sides.minWidth && !sides.maxWidth) {
				mouseX = e.clientX;
			}else{
				$position.width = oldWidth;
			}

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
		resizing = false;
		$position.maxLines = Math.round($position.maxLines);
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
			style:top = { $position.top + '%' } 
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
			<div class="caption-content-box" style="max-height: calc(1.25em * { Math.round($position.maxLines) });">
				<!-- Resize control shown only on hover -->
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
						{#each {length: 30} as _}
							This is a sample caption <br/>
						{/each}
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
