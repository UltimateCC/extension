import { useEffect, useState } from "react";
import api from "../../services/api";


function Webhooks() {
	const [url, setUrl] = useState<string>('');

	function loadUrl(regen?: boolean) {
		api('webhooks/url', {method: regen ? 'POST' : 'GET'})
		.then(response => {
			setUrl(location.origin + response.url);
		})
		.catch(err => {
			console.error('Error loading twitch config', err);
		});		
	}

	useEffect(()=>{
		loadUrl();
	}, []);

	function copyUrl() {
		try {
			navigator.clipboard.writeText(url);
		}catch(e) {
			console.error('Error writing to clipboard', e);
		}
	}

	function resetUrl() {
		setUrl('');
		loadUrl(true);
	}

	if(!url) {
		return (<div>Loading</div>)
	}

	return (
		<div>
			<button className={"theme-btn"} onClick={copyUrl}>
				<span>Copy base url</span>
			</button>
			<button className={"theme-btn danger-btn"} onClick={resetUrl}>
                <span>Reset url</span>
            </button>
		</div>
	);
}

export default Webhooks;