import FormGroup from '@mui/material/FormGroup';
import FormControlLabel, { formControlLabelClasses } from '@mui/material/FormControlLabel';
import Switch, { switchClasses } from '@mui/material/Switch';
import { alpha, styled } from '@mui/material/styles';
import api from '../../services/api';


const ThemedSwitch = styled(Switch)(({theme}) => ({
    [`& .${switchClasses.thumb}`]: {
        color: "#9F4EE5",
        '&:hover': {
            backgroundColor: alpha('#9F4EE5', theme.palette.action.hoverOpacity),
        },
    },

    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: "#9F4EE5",
    },

    [`& .${switchClasses.track}`]: {
        backgroundColor: "#D9D9D9",
        opacity: 0.8,
    },
}));

const ThemedFormControlLabel = styled(FormControlLabel)(() => ({
    [`& .${formControlLabelClasses.label}`]: {
        color: "#D9D9D9",
        fontSize: '1em',
        fontFamily: "Baloo",
    },
}));

interface TwitchProps {
    twitchAutoStop: boolean
    setTwitchAutoStop: (twitchAutoStop: boolean) => void
}

function Twitch({ setTwitchAutoStop, twitchAutoStop }: TwitchProps) {
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

    const handleAutoStopChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const autoStop = event.target.checked;
        setTwitchAutoStop(autoStop);
        api('config', {
            method: 'POST',
            body: { twitchAutoStop: autoStop }
        })
        .catch(err => {
            console.error('Error updating autostop', err);
        });
    }

    return (
        <div>
            <FormGroup>
                {/*
                <ThemedFormControlLabel 
                    control={<ThemedSwitch
                        checked={showCaptions}
                        onChange={handleChange}
                    />}
                    label="Show captions to viewers by default (Available soon)" />
                */}
                <ThemedFormControlLabel 
                    control={<ThemedSwitch
                        checked={twitchAutoStop}
                        onChange={handleAutoStopChange} 
                    />}
                    label="Stop captions when your stream ends (Experimental)" />
            </FormGroup>
        </div>
    );
}

export default Twitch;
