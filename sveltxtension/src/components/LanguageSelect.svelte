<script lang="ts">
    import { transcript } from "../lib/captions";
	import languages from "../assets/languages.json";
    import { settings } from "../lib/settings";

	// Last received languages are used as base list
	$: lastTranscript = $transcript[$transcript.length-1] || [];
	$: spokenLang = languages[lastTranscript[0]?.lang] || lastTranscript[0]?.lang || '';
</script>

{#if lastTranscript.length > 1}
	<select id="language-input" bind:value={$settings.language}>
		<option value="">Spoken language{ spokenLang ? (' (' + spokenLang + ')') : '' }</option>
		{#each lastTranscript as l }
			<option value={l.lang}>{ languages[l.lang] || l.lang }</option>
		{/each}
	</select>
{:else}
	<select id="language-input" disabled>
		<option selected>Translations unavailable</option>
	</select>
{/if}
