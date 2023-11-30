import { useEffect, useState } from "react";
import api from "../../services/api";
import loadingImg from '../../assets/loading.svg';
import { config } from "../../config";

function Webhooks() {
	const [url, setUrl] = useState<string>('');
    const [isLoadingRegen, setIsLoadingRegen] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

	function loadUrl(regen?: boolean) {
		api('webhooks/url', {method: regen ? 'POST' : 'GET'})
		.then(response => {
			setUrl(location.origin + response.url);
			setIsLoadingRegen(false);
		})
		.catch(err => {
			console.error('Error loading twitch config', err);
		});		
	}

	useEffect(()=>{
		loadUrl();
	}, []);

	function copyUrl() {
		navigator.clipboard.writeText(url)
		.then(()=>{
			setCopied(true);
		})
		.catch(e=>console.error('Error writing to clipboard', e));
	}

	function resetUrl() {
		setUrl('');
		loadUrl(true);
	}

	if(!url) {
		return (<img src={loadingImg} alt="loading" className="loading-img" />)
	}

	return (
		<div className="webhooks">
			<p>Control your dashboard from external sources (like a streamdeck) by sending HTTP requests</p>
			<a href={ config.github + '/wiki/Streamdeck-configuration' } target="_blank" rel="noreferrer">How it works ?</a>
			<div className="buttons">
				<button className={"theme-btn"} onClick={copyUrl}>
					<span>{ copied ? 'Copied !' : 'Copy base url' }</span>
				</button>
				<button className={"theme-btn danger-btn"} disabled={isLoadingRegen} onClick={resetUrl}>
					<span>{ isLoadingRegen ? 'Regenerating url' : 'Regenerate url' } </span>
				</button>
			</div>			
		</div>

	);
}

export default Webhooks;