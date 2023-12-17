import ConfigSwitch from '../ConfigSwitch';

interface TwitchProps {
    twitchAutoStop: boolean
    updateConfig: (config: {twitchAutoStop: boolean}) => Promise<void>
}

function Twitch({ updateConfig, twitchAutoStop }: TwitchProps) {
    /*
    const [showCaptions, setShowCaptions] = useState<boolean>(true);

    useEffect(()=>{
        api('twitchconfig')
        .then(response => {
            setShowCaptions(response.showCaptions ?? true);
        })
        .catch(err => {
            console.error('Error loading twitch config', err);
        });
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const showCaptions = event.target.checked;
        setShowCaptions(showCaptions);
        api('twitchconfig', {
            method: 'POST',
            body: { showCaptions }
        })
        .catch(err => {
            console.error('Error updating twitch config', err);
        });
    };
    */

    const handleAutoStopChange = (val: boolean) => {
        updateConfig({ twitchAutoStop: val })
        .catch(err => {
            console.error('Error updating autostop', err);
        });
    }

    return (
        <div className="twitch">
            {/*
            <ConfigSwitch
                checked={showCaptions}
                onChange={handleChange}
                label="Show captions to viewers by default (Available soon)"
            />
            */}
            <ConfigSwitch
                checked={twitchAutoStop}
                onChange={handleAutoStopChange}
                label="Stop captions when your stream ends (Experimental)"
            />
        </div>
    );
}

export default Twitch;
