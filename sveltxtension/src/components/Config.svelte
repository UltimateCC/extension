
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
	main { background-color: #37373E; color: #D9D9D9; font-family: Arial, Helvetica, sans-serif; font-size: 1em; }
	main { display: flex; align-items: center; justify-content: center; padding: 5em; }
	h2 { margin-bottom: .5em; }
	div { text-align: center; }
	a { color: #B072E8; }
</style>