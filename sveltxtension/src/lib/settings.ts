import { persisted } from "svelte-local-storage-store";

const defaultSettings = {
	language: '',
	positionLocked: false,
	fontSize: 12,
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

export const settings = persisted<SettingsType>('config', {...defaultSettings});

export const position = persisted<{ left?: number, bottom?: number }>('position', {});