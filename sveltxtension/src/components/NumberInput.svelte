
<script lang="ts">
	export let min: number;
	export let max: number;

	export let value: number;

	function check() {
		if(value<min) value=min;
		if(value>max) value=max;
	}
</script>

<input type="number" bind:value {min} {max} {...$$restProps} on:change={check} />