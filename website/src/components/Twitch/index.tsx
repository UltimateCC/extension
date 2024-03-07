import { useEffect } from 'react';
import { useSavedConfig } from '../../hooks/useSavedConfig';
import ConfigSwitch from '../ConfigSwitch';

interface TwitchProps {
    customDelayConfig: number
    twitchAutoStop: boolean
    updateConfig: (config: Partial<{twitchAutoStop: boolean, customDelay?: number}>) => Promise<void>
}

interface TwitchConfig {
    showCaptions: boolean
}

function Twitch({ /*customDelayConfig,*/ updateConfig, twitchAutoStop }: TwitchProps) {
	//const timeoutCustomDelay = useRef<ReturnType<typeof setTimeout>>();

    // Twitch config
    const {
        //config: twitchConfig,
        loadConfig: loadTwitchConfig,
        //updateConfig: updateTwitchConfig
    } = useSavedConfig<TwitchConfig>({apiPath: 'twitchconfig'});

    useEffect(()=>{
        loadTwitchConfig()
        .catch(err => {
            console.error('Error loading twitch config', err);
        });
    }, [loadTwitchConfig]);

    /*
    const handleShowCaptionsChange = (val: boolean) => {
        updateTwitchConfig({ showCaptions: val })
        .catch(err => {
            console.error('Error updating Twitch config', err);
        });
    }*/

    const handleAutoStopChange = (val: boolean) => {
        updateConfig({ twitchAutoStop: val })
        .catch(err => {
            console.error('Error updating autoStop', err);
        });
    }

    /*
    const updateCustomDelay = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Max 1s per update
        clearTimeout(timeoutCustomDelay.current);
        timeoutCustomDelay.current = setTimeout(()=>{
            const customDelay = Number.parseFloat(event.target.value);
            if(!Number.isNaN(customDelay) && customDelay !== customDelayConfig && customDelay >= -5 && customDelay <= 1800) {
                updateConfig({ customDelay })
                .catch(err => {
                    console.error('Error updating config', err);
                });
            } else {
                if (customDelay < -5) event.target.value = "-5";
                else if (customDelay > 1800) event.target.value = "1800";
            }
        }, 500);
    };*/

    return (
        <div className="twitch">
            <div className="twitch-switch-container">
                {/*
                    <ConfigSwitch
                        checked={ twitchConfig.showCaptions ?? true }
                        onChange={handleShowCaptionsChange}
                        label="Show captions to viewers by default"
                    />                
                */}
                <ConfigSwitch
                    checked={twitchAutoStop}
                    onChange={handleAutoStopChange}
                    label="Stop captions when your stream ends"
                />
            </div>

            {/*
                <div className="custom-delay">
                    <p>
                        Add delay to your captions to match your stream delay.
                    </p>
                    <div className="custom-delay-input">
                        <label>
                            Custom delay (in secondes)
                            <input className="theme-input" type="number" min="-5" max="1800" defaultValue={customDelayConfig} onChange={updateCustomDelay} step=".1" />
                        </label>
                    </div>
                </div>
            */}
        </div>
    );
}

export default Twitch;
