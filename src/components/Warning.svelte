
<div class="caption-warning">
	<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 71 71">
		<circle cx="36" cy="53" r="4" />
		<path d="M36 19L36 40" stroke-width="8" stroke-linecap="round"/>
		<circle cx="35.5" cy="35.5" r="32" stroke-width="7" fill="none"/>
	</svg>
	<div class="warning-content">
		<slot/>
	</div>
</div>

<style lang="scss">
	@import '../assets/vars.scss';	

	.caption-warning {
		background-color: #781A3D;
		box-shadow: 0 0 0.5em 0.1em #00000099 inset;
		font-size: 1em;
		height: 2.875em;
		border-radius: .25em;
		display: flex;
		align-items: center;
		gap: 0.25em;
		padding: 0.5em !important;

		svg { 
			fill: $settings-text-color;
			stroke: $settings-text-color;
			font-size: 2em;
			vertical-align: bottom;
		}

		.warning-content {
			width: 100%;
			text-align: center;
			font-weight: bold;
			font-size: 0.9em;
		}
	}
</style>