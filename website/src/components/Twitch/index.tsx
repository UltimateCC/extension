import { useState } from 'react';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel, { formControlLabelClasses } from '@mui/material/FormControlLabel';
import Switch, { switchClasses } from '@mui/material/Switch';
import { alpha, styled } from '@mui/material/styles';


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
        fontSize: 16,
        fontFamily: "Baloo",
    },
}));

function Twitch() {
    const [showCaptions, setShowCaptions] = useState<boolean>(true);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowCaptions(event.target.checked);
    };

    return (
        <div>
            <h5>When users enter your channel, please choose to either hide or display the caption by default.</h5>
            <FormGroup>
                <ThemedFormControlLabel 
                    control={<ThemedSwitch
                        checked={showCaptions}
                        onChange={handleChange} 
                    />}
                    label="Show captions by default" />
            </FormGroup>
        </div>
    );
}

export default Twitch;
