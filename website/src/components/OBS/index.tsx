import { useRef, useState, useEffect } from "react";
import ConfigSwitch from "../ConfigSwitch";
import { config } from "../../config";

import Alert from "../Alert";

interface OBSConfig {
	obsEnabled?: boolean,
	obsPort?: number,
	obsPassword?: string,
	obsSendCaptions?: boolean,
	obsAutoStop?: boolean
}

interface OBSProps {
	obsIsConnected: boolean
    userConfig: OBSConfig
	resfreshObs: () => void
    updateConfig: (config: Partial<OBSConfig>) => Promise<void>
}

export default function OBS({ obsIsConnected, userConfig, updateConfig, resfreshObs }: OBSProps) {
	const portInput = useRef<HTMLInputElement>(null);
	const passwordInput = useRef<HTMLInputElement>(null);

    const [response, setResponse] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string; } | null>(null);
	const [isLoadingRemove, setIsLoadingRemove] = useState<boolean>(false);

	const handleSwitch = (key: 'obsEnabled'|'obsSendCaptions'|'obsAutoStop', val: boolean) => {
        updateConfig({ [key]: val })
        .catch(err => {
            console.error('Error updating config', err);
        });
    }

	// Use effect obsIsConnected console.log
	useEffect(()=> {
		if (obsIsConnected) {
			setResponse({ type: 'info', message: 'The OBS connection was established' });
		} else {
			setResponse({ type: 'warning', message: 'The OBS connection failed. Please check the port and password' });
		}
	}, [obsIsConnected, updateConfig]);

	const updateObsAuth = () => {
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
			newConfig.obsEnabled = true;

			updateConfig(newConfig)
			.catch(err => {
				console.error('Error updating config', err);
			});
		} else {
			setResponse({ type: "error", message: 'Invalid port or password' });
		}
	}

	const removeOBSSettings = () => {
		setIsLoadingRemove(true);
		updateConfig({obsPort: 4455, obsPassword: ""})
		.then(()=>{
			setIsLoadingRemove(false);
		})
		.catch(err => {
			console.error('Error updating config', err);
		});
	}

	return (
		<div className="obs">
			{userConfig.obsPassword && response && userConfig.obsEnabled && (
                <Alert
                    type={response.type}
                    message={response.message}
					onReload={resfreshObs}
                />
            )}

			<p>
				Connect to OBS via websocket to send closed captions with your video stream, making them available on most streaming platforms
			</p>
			<p>
				<a href={ config.github + '/wiki/OBS-websocket-connection' }>Read more</a>
			</p>

			<ConfigSwitch
				checked={userConfig.obsEnabled??false}
				onChange={(val)=>{ handleSwitch('obsEnabled', val) }}
				label="Enable connection to OBS"
			/>
			{userConfig.obsEnabled && (
				!obsIsConnected ? (
					<form className="url">
						<label>
							Port
							<input className="theme-input" type="text" ref={portInput} defaultValue="4455" />
						</label>
						<label>
							Password
							<input className="theme-input" type="password" ref={passwordInput} placeholder={"*".repeat(userConfig.obsPassword?.length ?? 0)}/>
						</label>
						<button className="theme-btn" onClick={(e) => { e.preventDefault(); updateObsAuth() } } type="submit">
							<span>Save</span>
						</button>
					</form>
				) : (
					<>
						<button className="theme-btn danger-btn" onClick={removeOBSSettings} type="submit">
							<span>{isLoadingRemove ? 'Removing...' : 'Reset my OBS auth'} </span>
						</button>
						<div>
							{ userConfig.obsEnabled && (
								<>
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
								</>
							) }
						</div>
					</>
				)
			)}
		</div>
	)
}