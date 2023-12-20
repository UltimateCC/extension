import { useRef } from "react";
import ConfigSwitch from "../ConfigSwitch";
import { config } from "../../config";

interface OBSConfig {
	obsEnabled?: boolean,
	obsPort?: number,
	obsPassword?: string,
	obsSendCaptions?: boolean,
	obsAutoStop?: boolean
}

interface OBSProps {
    userConfig: OBSConfig
    updateConfig: (config: Partial<OBSConfig>) => Promise<void>
}

export default function OBS({ userConfig, updateConfig }: OBSProps) {
	const portInput = useRef<HTMLInputElement>(null);
	const passwordInput = useRef<HTMLInputElement>(null);

	const handleSwitch = (key: 'obsEnabled'|'obsSendCaptions'|'obsAutoStop', val: boolean) => {
        updateConfig({ [key]: val })
        .catch(err => {
            console.error('Error updating config', err);
        });
    }

	const saveUrl = () => {
		const obsPort = Number.parseInt(portInput.current?.value??'');
		const obsPassword = passwordInput.current?.value;
		const newConfig: Partial<OBSConfig> = {};
		let update = false;
		if(obsPort && !Number.isNaN(obsPort)) {
			newConfig.obsPort = obsPort;
			update = true;
		}
		if(obsPassword && obsPassword!=='placeholder') {
			newConfig.obsPassword = obsPassword;
			update = true;
		}
		if(update) {
			updateConfig(newConfig)
			.catch(err => {
				console.error('Error updating config', err);
			});
		}
	}

	return (
		<div className="obs">
			<p>
				Connect to OBS via websocket to send closed captions with your video stream, making them available on most streaming platforms
			</p>
			<p>
				<a href={ config.github + '/wiki/OBS-websocket-connection' }>Read more</a>
			</p>
			<div className="url">
				<label>
					Port
					<input className="theme-input" type="text" ref={portInput} defaultValue={userConfig.obsPort??4455} />
				</label>
				<label>
					Password
					<input className="theme-input" type="password" ref={passwordInput} defaultValue={userConfig.obsPassword ? 'placeholder' : ''} />
				</label>
				<button className="theme-btn" onClick={saveUrl}>
					<span>Save</span>
				</button>
			</div>
			{
				!!(userConfig.obsPort && userConfig.obsPassword) && (
					<ConfigSwitch
					checked={userConfig.obsEnabled??false}
					onChange={(val)=>{ handleSwitch('obsEnabled', val) }}
					label="Enable connection to OBS"
					/>
				)
			}

			{ userConfig.obsEnabled && (
				<div>
					<ConfigSwitch
						checked={userConfig.obsSendCaptions??true}
						onChange={(val)=>{ handleSwitch('obsSendCaptions', val) }}
						label="Send captions to OBS (Spoken language only)"
					/>
					<ConfigSwitch
						checked={userConfig.obsAutoStop??true}
						onChange={(val)=>{ handleSwitch('obsAutoStop', val) }}
						label="Stop captions when ending your stream on OBS"
					/>
				</div>
			) }
		</div>
	)
}