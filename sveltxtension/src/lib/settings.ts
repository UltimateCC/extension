import { derived } from "svelte/store";
import { persisted } from "./persistedStore";
import { twitchChannel } from "./twitch";

const defaultSettings = {
	language: '',
	fontSize: 20,
	textColor: '#E0E0E0',
	fontFamily: 'Arial, Helvetica, sans-serif',
	maxLines: 2,
	backgroundColor: '#37373E',
	backgroundOpacity: 50
}

export type SettingsType = typeof defaultSettings;

export function resetSettings() {
	settings.set({...defaultSettings});
}

export const settings = persisted<SettingsType>('ucc_config', {...defaultSettings});

const defaultPosition = {
	bottom: 10,
	left: 50,
	locked: false
}

export type PositionType = typeof defaultPosition;

export function resetPosition() {
	position.set({...defaultPosition});
}

export const position = persisted<PositionType>('ucc_position', {...defaultPosition});

// Store setting for captions shown or not when user updated it
export const showCaptions = persisted<boolean | undefined>(
	derived(twitchChannel, (id) => id ? 'ucc_showCaptions_'+id : ''),
	undefined);


