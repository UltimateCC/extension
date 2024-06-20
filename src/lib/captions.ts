import { get, writable } from "svelte/store";
import { twitchContext } from "./twitch";
import type { LangCode } from "./utils";

export interface Caption {
	lang: LangCode
	text: string
}

export type CaptionsData = {
	delay: number
	duration: number
} & CaptionLine

interface CaptionLine {
	speaker?: string
	lineEnd: boolean
	final: boolean
	captions: Caption[]
}

/** Complete transcript, each array is a line (may be separated in multiple part) */
export const transcript = writable<CaptionLine[][]>([]);

/** Last received captions (used for language list) */
export const lastReceivedCaptions = writable<Caption[]>([]);

// Handle received captions
export async function handleCaptions(data: CaptionsData) {
	lastReceivedCaptions.set(data.captions);
	
	const { delay, duration, ...newText } = data;

	// Delay captions for stream latency minus accumulated processing delay
	const waitTime = (( get(twitchContext)?.hlsLatencyBroadcaster || 4 ) * 1000) - delay;
	await new Promise(res => setTimeout(res, waitTime));

	transcript.update((transcript) => {

		// Index of last line from speaker
		const lastLine = transcript.findLast(l => l[0].speaker===data.speaker);

		if(lastLine && !lastLine[lastLine.length-1].lineEnd) {
			// Last line from speaker not finished

			if(lastLine[lastLine.length-1].final) {
				// Last text was final: append after it
				lastLine.push(newText);
			}else{
				// Last text was not final: replace it
				lastLine[lastLine.length-1] = newText;
			}
		}else{
			// Add text as a new line
			transcript.push([newText]);
		}
		if(transcript.length > 50) transcript.shift();
		return transcript;
	});
}
