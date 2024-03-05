import { get, writable } from "svelte/store";
import { twitchContext } from "./twitch";
import languages from "../assets/languages.json";
import { language } from "./settings";
import { smoothText } from "./smoothText";

export type LangCode = keyof typeof languages;

export interface Caption {
	lang: LangCode
	text: string
}

export interface CaptionsData {
	final: boolean
	lineEnd: boolean
	delay: number
	duration: number
	captions: Caption[]
}

// Complete transcript
export const transcript = writable<Caption[][]>([]);

// Last line visible (written smoothly)
export const partialCaptions = smoothText();

// Reset smooth text when language changes
language.subscribe(()=>{
	partialCaptions.clear();
});

// Final part of the last line visible
let currentFinal: Caption[] = [];

// Last received captions (used for language list)
export const lastReceivedCaptions = writable<Caption[]>([]);

// Handle received captions
export async function handleCaptions(data: CaptionsData) {
	lastReceivedCaptions.set(data.captions);

	// Delay captions for stream latency minus accumulated processing delay
	const delay = (( get(twitchContext)?.hlsLatencyBroadcaster || 4 ) * 1000) - data.delay;
	await new Promise(res => setTimeout(res, delay));

	// Get actual text to show depending on selected language
	const currentLang = get(language);
	const caption = data.captions.find(c => c.lang === currentLang) ?? data.captions[0];
	const finalText = (currentFinal.find(c => c.lang === currentLang) ?? currentFinal[0])?.text;

	const text = (finalText ? `${finalText} ` : '') + caption.text;

	// Merge final texts
	let finalToPush: Caption[] | null = null;
	if(data.final) {
		// Merge current final text
		data.captions.forEach((newCaption) => {
			const current = currentFinal.find(c=>c.lang===newCaption.lang);
			if(current) {
				current.text += ` ${caption.text}`;
			}else{
				currentFinal.push({...newCaption});
			}
		});

		// If end of line, put final text aside for pushing to transcript
		if(data.lineEnd ?? true) {
			finalToPush = currentFinal;
			currentFinal = [];
		}
	}

	// Set the text along the duration
	await partialCaptions.setText(text, data.duration);

	// Push final text to transcript
	if(finalToPush) {
		partialCaptions.clear();

		transcript.update((array)=>{
			array.push(finalToPush!);
			if(array.length > 50) array.shift();
			return array;
		});			
	}
}
