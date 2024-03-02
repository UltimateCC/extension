import { useEffect, useState } from "react";
import api from "../../services/api";
import loadingImg from '../../assets/loading.svg';
import { config } from "../../config";
import { langList } from "../../services/langs";

interface BrowserSourceProps {
    selectedLanguageCode?: string[];
	spokenLang?: string
    configLoaded: boolean;
}


function BrowserSource({ selectedLanguageCode, spokenLang, configLoaded }: BrowserSourceProps) {
	const [url, setUrl] = useState<string>('');
    const [isLoadingRegen, setIsLoadingRegen] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

	const [fontFamily, setFontFamily] = useState<string>('Arial, Helvetica, sans-serif');
	const [fontColor, setFontColor] = useState<string>('#E0E0E0');
	const [bgColor, setBgColor] = useState<string>('#37373E');
	const [browserSrcLang, setBrowserSrcLang] = useState<string>("");

	function loadUrl(regen?: boolean) {
		api('browsersource/url', {method: regen ? 'POST' : 'GET'})
		.then(response => {
            console.log('response', response.url);
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

	if(!url || !configLoaded) {
		// return (<img src={loadingImg} alt="loading" className="loading-img" />);
	}
	
	return (
		<div className="browser-source">
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores, laudantium tempora? Laudantium cum dolores nisi minima, perspiciatis, illum fuga, cupiditate praesentium reprehenderit voluptates expedita molestiae? Dolor consectetur et voluptas eaque!</p>
			<a href={ config.github + '/wiki/Streamdeck-configuration' } target="_blank" rel="noreferrer">Read more</a>
            
			<div className="optional-styling">
				<div className="styling-inputs">
					<h4>Settings (optional)</h4>
					
					<div>
						<label>
							Choose language
							<select className="theme-select" value={browserSrcLang} onChange={e=>setBrowserSrcLang(e.target.value)}>
								<option value="">Spoken language { (spokenLang && langList[spokenLang.substring(0, 2)]) ? "(" + langList[spokenLang.substring(0, 2)] + ")" : "" }</option>
								{ selectedLanguageCode?.map(code => ( <option value={code} key={code}>{langList[code]}</option> ) ) }
							</select>
						</label>

						<label>
							Select font
							<select className="theme-select" value={fontFamily} onChange={e=>setFontFamily(e.target.value)}>
								<option value="Arial, Helvetica, sans-serif">Arial</option>
								<option value="Calibri, sans-serif">Calibri</option>
								<option value="Courier New, Courier, monospace">Courier New</option>
								<option value="OpenDyslexic, sans-serif">OpenDyslexic</option>
								<option value="Roboto, sans-serif">Roboto</option>
								<option value="Times New Roman, Times, serif">Times New Roman</option>
								<option value="Verdana, sans-serif">Verdana</option>
							</select>
						</label>

						<label>
							Font color
							<input className="theme-color" type="color" value={fontColor} onChange={e=>setFontColor(e.target.value)} />
						</label>

						<label>
							Background of text
							<input className="theme-color" type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} />
						</label>
					</div>
				</div>
				<div className="preview">
					<h4>Preview</h4>
					<div className="preview-content">
						<p>
							<span style={{fontFamily, color: fontColor, backgroundColor: bgColor}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta, error ipsam nemo suscipit quidem officiis magni quod dolore atque, ullam cupiditate eligendi similique dolorum porro? Provident voluptas laborum nulla atque.</span>
						</p>
					</div>
				</div>
			</div>

			<div className="buttons">
				<button className={"theme-btn"} onClick={copyUrl}>
					<span>{ copied ? 'Copied !' : 'Copy url' }</span>
				</button>
				<button className={"theme-btn danger-btn"} disabled={isLoadingRegen} onClick={resetUrl}>
					<span>{ isLoadingRegen ? 'Regenerating url' : 'Regenerate url' } </span>
				</button>
			</div>			
		</div>
	);
}

export default BrowserSource;