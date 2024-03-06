import { useEffect, useState } from "react";
import { config } from "../../config";
import { langList } from "../../services/langs";

import ConfigSwitch from "../ConfigSwitch";
import loadingImg from '../../assets/loading.svg';

interface BrowserSourceProps {
    selectedLanguageCode?: string[];
	spokenLang?: string
    configLoaded: boolean;
	browserSourceEnabled: boolean;
	updateConfig: (config: {browserSourceEnabled: boolean}) => Promise<void>
	userId: string;
}


function BrowserSource({ selectedLanguageCode, spokenLang, browserSourceEnabled, updateConfig, configLoaded, userId }: BrowserSourceProps) {
	const [url, setUrl] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);
	const [lineHeight, setLineHeight] = useState<string>("1em");

	const [fontFamily, setFontFamily] = useState<string>('Arial');
	const [fontColor, setFontColor] = useState<string>('#E0E0E0');
	const [bgColor, setBgColor] = useState<string>('#37373E');
	const [browserSrcLang, setBrowserSrcLang] = useState<string>("");

	function copyUrl() {
		navigator.clipboard.writeText(url)
		.then(()=>{
			setCopied(true);
		})
		.catch(e=>console.error('Error writing to clipboard', e));
	}

	function handleBrowserSourceChange(val: boolean) {
		updateConfig({ browserSourceEnabled: val })
		.catch(err => {
			console.error('Error updating browser source', err);
		});
	}

	useEffect(() => {
		const url = new URL(location.origin + '/browsersource.html');
		url.searchParams.set('userId', userId);
		if(browserSrcLang) url.searchParams.set('lang', browserSrcLang);
		if(fontFamily) url.searchParams.set('font', fontFamily);
		if(fontColor) url.searchParams.set('color', fontColor);
		if(bgColor) url.searchParams.set('bg', bgColor);
		setUrl(url.toString());
	}, [fontFamily, fontColor, bgColor, browserSrcLang, userId]);

	function changeFontStyling(newFont: string) {
		setFontFamily(newFont);
		switch(newFont) {
			case "Arial":
				setLineHeight("1.1em");
				break;

			case "Calibri":
				setLineHeight("1.2em");
				break;

			case "Courier New":
				setLineHeight("1em");
				break;

			case "OpenDyslexic":
				setLineHeight("1.5em");
				break;
			
			case "Roboto":
				setLineHeight("1.2em");
				break;

			case "Times New Roman":
				setLineHeight("1.1em");
				break;

			case "Verdana":
				setLineHeight("1.1em");
				break;

			default:
				setLineHeight("1em");
				break;
		}
	}

	if(!configLoaded || userId === "" || (browserSourceEnabled && !url)) {
		return (<img src={loadingImg} alt="loading" className="loading-img" />);
	}

	return (
		<div className="browser-source">
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores, laudantium tempora? Laudantium cum dolores nisi minima, perspiciatis, illum fuga, cupiditate praesentium reprehenderit voluptates expedita molestiae? Dolor consectetur et voluptas eaque!</p>
			<a href={ config.github + '/wiki/Streamdeck-configuration' } target="_blank" rel="noreferrer">Read more</a>
            <ConfigSwitch
                checked={browserSourceEnabled}
                onChange={handleBrowserSourceChange}
                label="Enable browser source"
            />

			{ browserSourceEnabled && 
				<>
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
									<select className="theme-select" value={fontFamily} onChange={e=>changeFontStyling(e.target.value)}>
										<option value="Arial">Arial</option>
										<option value="Calibri">Calibri</option>
										<option value="Courier New">Courier New</option>
										<option value="OpenDyslexic">OpenDyslexic</option>
										<option value="Roboto">Roboto</option>
										<option value="Times New Roman">Times New Roman</option>
										<option value="Verdana">Verdana</option>
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
								<p style={{lineHeight}}>
									<span style={{fontFamily, color: fontColor, backgroundColor: bgColor}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta, error ipsam nemo suscipit quidem officiis magni quod dolore atque, ullam cupiditate eligendi similique dolorum porro? Provident voluptas laborum nulla atque.</span>
								</p>
							</div>
						</div>
					</div>
				
					<div className="url-container">
						<p className="url-preview">{url}</p>

						<button className={"theme-btn"} onClick={copyUrl}>
							<span>{ copied ? 'Copied !' : 'Copy url' }</span>
						</button>
					</div>
				</>
			}			
		</div>
	);
}

export default BrowserSource;