import { persisted } from "./stores/persistedStore";
import { resetablePersisted } from "./stores/resetablePersisted";

const defaultSettings = {
	fontSize: 20,
	textColor: '#E0E0E0',
	fontFamily: 'Arial, Helvetica, sans-serif',
	backgroundColor: '#37373E',
	backgroundOpacity: 50,
	strokeColor: '#E0E0E0',
	strokeSize: 0,
	textAlign: 'left',
	textTransform: 'none',
}

export type SettingsType = typeof defaultSettings;

const defaultPosition = {
	bottom: 8, // %
	left: 25, // %
	width: 50, // %
	maxLines: 2, // lines
	locked: false,
}

export type PositionType = typeof defaultPosition;

// General settings
export const settings = resetablePersisted<SettingsType>('ucc_config', () => { return {...defaultSettings}; });

// Position/size
export const position = resetablePersisted<PositionType>('ucc_position', () => { return {...defaultPosition}; });

// Reset position if format from old version is found
position.subscribe((val: any)=>{
	if(val.width === undefined || val.top !== undefined) {
		position.reset();
	}
});

export function initContext(channelId: string) {
	const context = new Map();

	// Store setting for captions shown or not when user updated it
	context.set('showCaptions', persisted<boolean | undefined>(`ucc_showCaptions_${channelId}`, undefined));

	// Store setting for captions language (different between streamers)
	context.set('language', resetablePersisted<string>(`ucc_language_${channelId}`, () => ''));

	return context;
}
