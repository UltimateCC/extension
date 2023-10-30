
import { Result, TranscriptData } from "../types";
import { SpeechToText } from "./SpeechToText";


//TODO: Fill languages codes for all languages supported by openAI
// Afrikaans, Arabic, Armenian, Azerbaijani, Belarusian, Bosnian, Bulgarian, Catalan, Chinese, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, Galician, German, Greek, Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Kannada, Kazakh, Korean, Latvian, Lithuanian, Macedonian, Malay, Marathi, Maori, Nepali, Norwegian, Persian, Polish, Portuguese, Romanian, Russian, Serbian, Slovak, Slovenian, Spanish, Swahili, Swedish, Tagalog, Tamil, Thai, Turkish, Ukrainian, Urdu, Vietnamese, and Welsh

// Map openAI languages names to standard codes
const langs = {
	'english': 'en',
	'french': 'fr',
}

export class WhisperOpenAIStt extends SpeechToText {

	ready() {
		return !!this.secrets.openaiKey
	}

	async transcribe(data: Buffer, duration: number): Promise<Result<TranscriptData | null>> {
		if(!this.ready()) return  { isError: true, message: 'Missing OpenAI API key' };

		const start = Date.now();

		const body = new FormData();
		body.append('file', new Blob([data]), 'data.wav');
		body.append('model', 'whisper-1');
		body.append('response_format', 'verbose_json');

		const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
			headers: {
				"Authorization": "Bearer " + this.secrets.openaiKey,
			},
			method: 'POST',
			body: body
		});

		if(!res.ok) {
			return { isError: true, message: 'OpenAI Whisper error: ' + res.status + ' ' + res.statusText }
		}

		const out = await res.json();

		let lang = '';
		if(out.language in langs) {
			lang = out.language;
		}
		// Basic check to discard if there is probably no speech
		if(out.segments.length === 1 && out.segments[0].no_speech_prob > .6) {
			return { isError: false, data: null };
		}

		return {
			isError: false,
			data: {
				delay: duration + Date.now() - start,
				duration,
				lang,
				text: out.text,
				final: true
			}
		} 
	}

}