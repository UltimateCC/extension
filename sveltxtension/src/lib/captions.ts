
import { get, writable } from "svelte/store";
import { twitchContext } from "./twitch";
import languages from "../assets/languages.json";
import { settings } from "./settings";


export interface Caption {
	lang: keyof typeof languages
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
export const finalCaptions = writable<string>('');

// Complete transcript
export const transcript = writable<Caption[][]>([]);


// Handle received captions
export function handleCaptions(data: CaptionsData) {
	// Delay captions for stream latency minus accumulated processing delay
	const delay = (( get(twitchContext).hlsLatencyBroadcaster || 1 ) * 1000) - data.delay;

	setTimeout( ()=>{
		const caption = data.captions.find(c => c.lang === get(settings).language) ?? data.captions[0];
		if(caption) {
			if(data.final) {
				// Update captions
				finalCaptions.update(content => {
					// Add new text
					content += ' ' + caption.text;
					// Limit to 400 words
					return content.split(" ").slice(-400).join(" ");
				});
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
				transcript.update((array)=>{
					return array;
				});
			}
		}
	}, delay);
}

