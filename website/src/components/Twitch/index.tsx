import { useEffect } from 'react';
import { useSavedConfig } from '../../hooks/useSavedConfig';
import ConfigSwitch from '../ConfigSwitch';

interface TwitchProps {
    twitchAutoStop: boolean
    updateConfig: (config: {twitchAutoStop: boolean}) => Promise<void>
}

interface TwitchConfig {
    showCaptions: boolean
}

function Twitch({ updateConfig, twitchAutoStop }: TwitchProps) {
    // Twitch config
    const {
        // config: twitchConfig,
        loadConfig: loadTwitchConfig,
        // updateConfig: updateTwitchConfig
    } = useSavedConfig<TwitchConfig>({apiPath: 'twitchconfig'});

    useEffect(()=>{
        loadTwitchConfig()
        .catch(err => {
            console.error('Error loading twitch config', err);
        });
    }, [loadTwitchConfig]);

    // const handleShowCaptionsChange = (val: boolean) => {
    //     updateTwitchConfig({ showCaptions: val })
    //     .catch(err => {
    //         console.error('Error updating Twitch config', err);
    //     });
    // }

    const handleAutoStopChange = (val: boolean) => {
        updateConfig({ twitchAutoStop: val })
        .catch(err => {
            console.error('Error updating autoStop', err);
        });
    }

    return (
        <div className="twitch">
            {/* <ConfigSwitch
                checked={ twitchConfig.showCaptions ?? true }
                onChange={handleShowCaptionsChange}
                label="Show captions to viewers by default"
            /> */}
            <ConfigSwitch
                checked={twitchAutoStop}
                onChange={handleAutoStopChange}
                label="Stop captions when your stream ends"
            />
        </div>
    );
}

export default Twitch;
