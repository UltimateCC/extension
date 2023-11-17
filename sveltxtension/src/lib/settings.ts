import { persisted } from "svelte-local-storage-store";

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