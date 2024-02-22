import { useRef } from "react";
import ConfigSwitch from "../ConfigSwitch";
import { config } from "../../config";

interface OBSConfig {
	customDelay?: number,
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
	const timeoutCustomDelay = useRef<ReturnType<typeof setTimeout>>();

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

	const updateCustomDelay = (event: React.ChangeEvent<HTMLInputElement>) => {
		// Max 1s per update
		clearTimeout(timeoutCustomDelay.current);
		timeoutCustomDelay.current = setTimeout(()=>{
			const customDelay = Number.parseFloat(event.target.value);
			if(!Number.isNaN(customDelay) && customDelay !== userConfig.customDelay && customDelay >= -5 && customDelay <= 1800) {
				updateConfig({ customDelay })
				.catch(err => {
					console.error('Error updating config', err);
				});
			} else {
				if (customDelay < -5) event.target.value = "-5";
				else if (customDelay > 1800) event.target.value = "1800";
			}

		}, 500);
	};

	return (
		<div className="obs">
			<p>
				Add delay to your captions to match your stream delay.
			</p>
			<div className="customDelay">
				<label>
					Custom delay (in secondes)
					<input className="theme-input" type="number" min="-5" max="1800" defaultValue={userConfig.customDelay??0} onChange={updateCustomDelay} step=".1" />
				</label>
			</div>
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