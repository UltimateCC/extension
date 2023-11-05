
<script lang="ts">
	const url = "https://ultimatecc.net";
	const dashboardUrl = url + "/dashboard";
</script>

<main>
	<div>
		<h2>Thanks for installing <a href={url} target="_blank" rel="noreferrer">Ultimate Closed Captions</a></h2>
		<p>
			To work correctly, this extension requires you to use the dashboard at
			<a href={ dashboardUrl } target="_blank" rel="noreferrer">{ dashboardUrl }</a>
		</p>
	</div>
</main>

<style>
	main { height: 100%; background-color: #0e0e10; color: #eee; font-family: Arial, Helvetica, sans-serif; }
	div { text-align: center; padding: 1em; }
</style>