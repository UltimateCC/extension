
import { derived, get, writable } from "svelte/store";
import { twitchContext } from "./twitch";
import languages from "../assets/languages.json";
import { language } from "./settings";

export type LangCode = keyof typeof languages;

export interface Caption {
	lang: LangCode
	text: string
}

export interface CaptionsData {
	final: boolean
	delay: number
	duration: number
	captions: Caption[]
}

// Current captions
export const partialCaptions = writable<string>('');

// Complete transcript
export const transcript = writable<Caption[][]>([]);

// Last line of the transcript (used for language list)
export const lastTranscript = writable<Caption[]>([]);

// Handle received captions
export function handleCaptions(data: CaptionsData) {
	// Delay captions for stream latency minus accumulated processing delay
	const delay = (( get(twitchContext)?.hlsLatencyBroadcaster || 4 ) * 1000) - data.delay;
	lastTranscript.set(data.captions);

	setTimeout( ()=>{
		const caption = data.captions.find(c => c.lang === get(language)) ?? data.captions[0];
		if(caption) {
			if(data.final) {
				partialCaptions.set('');

				// Update transcript
				transcript.update((array)=>{
					array.push(data.captions);
					if(array.length > 50) array.shift();
					return array;
				});
			}else{
				// Update captions
				partialCaptions.set(caption.text);
			}
		}
	}, delay);
}

