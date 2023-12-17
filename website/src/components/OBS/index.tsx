import { useRef } from "react";
import ConfigSwitch from "../ConfigSwitch";


interface OBSConfig {
	obsEnabled?: boolean,
	obsPort?: number,
	obsPassword?: string,
	obsSendCaptions?: boolean,
	obsAutoStop?: boolean
}


interface OBSProps {
    config: OBSConfig
    updateConfig: (config: Partial<OBSConfig>) => Promise<void>
}

export default function OBS({config, updateConfig}: OBSProps) {
	const portInput = useRef<HTMLInputElement>();
	const passwordInput = useRef<HTMLInputElement>();

	const handleSwitch = (key: 'obsEnabled'|'obsSendCaptions'|'obsAutoStop', val: boolean) => {
        updateConfig({ [key]: val })
        .catch(err => {
            console.error('Error updating config', err);
        });
    }

	const saveUrl = () => {
		const obsPort = Number(portInput.current?.value);
		const obsPassword = passwordInput.current?.value;
		if(!Number.isNaN(obsPort) && obsPassword) {
			updateConfig({ obsPort, obsPassword })
			.catch(err => {
				console.error('Error updating config', err);
			});
		}
	}

	return (
		<div className="obs">
			<div className="url">
				<label>
					Port
					<input className="theme-input" type="text" value={config.obsPort} />
				</label>
				<label>
					Password
					<input className="theme-input" type="password" />
				</label>
				<button className="theme-btn" onClick={saveUrl}>
					<span>Save</span>
				</button>
			</div>
			<ConfigSwitch
				checked={config.obsEnabled??false}
				onChange={(val)=>{ handleSwitch('obsEnabled', val) }}
				label="Connect to OBS websocket server"
			/>
			{ config.obsEnabled && (
				<div>
					<ConfigSwitch
						checked={config.obsSendCaptions??true}
						onChange={(val)=>{ handleSwitch('obsSendCaptions', val) }}
						label="Send captions to OBS (Only spoken language)"
					/>
					<ConfigSwitch
						checked={config.obsAutoStop??true}
						onChange={(val)=>{ handleSwitch('obsAutoStop', val) }}
						label="Stop listening when ending your stream on OBS"
					/>
				</div>
			) }
		</div>
	)
}