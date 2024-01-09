import { derived } from "svelte/store";
import { persisted } from "./persistedStore";
import { twitchChannel } from "./twitch";

const defaultSettings = {
	fontSize: 20,
	textColor: '#E0E0E0',
	fontFamily: 'Arial, Helvetica, sans-serif',
	maxLines: 2,
	backgroundColor: '#37373E',
	backgroundOpacity: 50
}

export type SettingsType = typeof defaultSettings;

export const settings = persisted<SettingsType>('ucc_config', {...defaultSettings});

export function resetSettings() {
	settings.set({...defaultSettings});
}

const defaultPosition = {
	bottom: 10,
	left: 50,
	locked: false,
	width: 50, // %
}

export type PositionType = typeof defaultPosition;

// == Position ==
export const position = persisted<PositionType>('ucc_position', {...defaultPosition});

export function resetPosition() {
	position.set({...defaultPosition});
}

// Store setting for captions shown or not when user updated it
export const showCaptions = persisted<boolean | undefined>(
	derived(twitchChannel, (id) => id ? 'ucc_showCaptions_'+id : ''),
	undefined
);

// Store setting for captions language (different between streamers)
export const language = persisted<string>(
	derived(twitchChannel, (id) => id ? 'ucc_language_'+id : ''),
	''
);
