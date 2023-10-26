
import { CaptionsData, Result } from "../types";
import { SpeechToText } from "./SpeechToText";


export class DeepgramStt extends SpeechToText {

	ready() {
		return !!this.secrets.deepgramKey
	}

	async transcribe(data: Buffer, duration: number): Promise<Result<CaptionsData | null>> {
		if(!this.ready()) return { isError: true, message: 'API key missing' };

		const start = Date.now();

		const params = new URLSearchParams();
		params.append('detect_language', 'true');
		params.append('punctuate', 'false');
		params.append('tier', 'nova');

		const res = await fetch('https://api.deepgram.com/v1/listen?'+params, {
			headers: {
				"Authorization": 'Token ' + this.secrets.deepgramKey,
				"Content-Type": 'audio/wav'
			},
			method: 'POST',
			body: data
		});

		if(!res.ok) {
			return {
				isError: true,
				message: 'Deepgram API error: ' + res.status + ' ' + res.statusText
			}
		}

		const out = await res.json();
		const channel = out?.results?.channels[0];
		const lang = channel?.detected_language;
		const text = channel?.alternatives[0]?.transcript;

		if(lang && text) {
			return {
				isError: false,
				data: {
					delay: duration + Date.now() - start,
					duration,
					captions: [{ lang, text }]
				}
			} 
		}else{
			return {
				isError: false,
				data: null
			};
		}
	}

}