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
        fontSize: '1em',
        fontFamily: "Raleway",
    },
}));

interface ConfigSwitchProps {
	label: string
	checked: boolean
	onChange: (newChecked: boolean) => void
}

export default function ConfigSwitch({ label, checked, onChange }: ConfigSwitchProps) {

	return (
		<ThemedFormControlLabel 
		control={<ThemedSwitch
			checked={checked}
			onChange={(event)=>{ onChange(event.target.checked); }} 
		/>}
		label={label} />
	)
}