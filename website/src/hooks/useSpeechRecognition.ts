import { useEffect, useState } from "react";
import { TranscriptData } from "../context/SocketContext";


/** Speech recognition using Web Speech API */
export function useSpeechRecognition( { handleText, lang, listening, splitDelay, delay }: {
		handleText: (transcript: TranscriptData) => void,
		lang?: string,
		listening: boolean,
		splitDelay: number,
		delay: number
	}
) {
	const [error, setError] = useState<string>();
	const [text, setText] = useState<string>('');

	useEffect(()=>{

		let stopFunc = ()=>{};
		let stopped = false;
		if(listening) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			if(!SpeechRecognition) {
				setError('Speech recognition not supported in this browser, try using Chrome or Edge');
				return;
			}
			if(!lang) {
				setError('No language selected');
				return;
			}
			setError(undefined);

			const recognition = new SpeechRecognition();
			recognition.lang = lang;
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.maxAlternatives = 1;

			// Log relevant errors
			recognition.onerror = (event) => {
				if(event.error !== 'aborted' && event.error !== 'no-speech' && event.error !== 'network') {
					setError('Speech recognition error : '+event.error);
					console.error('Speech recognition error', event.error);
				}
			}

			let startTime: number = 0;
			recognition.onstart = () => {
				if(!startTime) startTime = Date.now();
				console.log('started');
			}

			//Restart recognition when it ends itself
			recognition.onend = () => {
				console.log('ended');
				if(!stopped) {
					// If stopping just after start: Probably not supported
					if(startTime && ( (Date.now() - startTime) > 100 ) ) {
						setError('Couldn\'t start speech recognition, it may not be supported in your browser, try using Chrome or Edge');
					}else{
						recognition.start();
					}
				}
			}

			let lastCaptions: number | null = null;

			recognition.onresult = (event) => {
				const result = event.results[event.resultIndex];

				const text = normalizeTranscript(result[0].transcript);

				setText(text);

				// Ignore partials between each partial caption
				if(!result.isFinal && lastCaptions && ( (lastCaptions + splitDelay) > Date.now() ) ) {
					return;
				}

				// Ignore first partial captions
				if(text && (result.isFinal || lastCaptions) ) {
					// Duration/delay is time since last partial sent
					// Default duration is split delay ( happens mostly when results received in wrong order )
					let duration = splitDelay;
					if(lastCaptions) {
						duration = Date.now() - lastCaptions;
					}
					handleText({
						text,
						lang,
						duration,
						delay: duration - delay,
						final: result.isFinal
					});
				}

				if(result.isFinal) {
					// Reset timestamps when sentence ends
					lastCaptions = null;
				}else{
					// Setup timestamp for next partial time
					lastCaptions = Date.now();
				}
			}

			recognition.start();

			stopFunc = () =>{
				recognition.abort();
			}
		}else{
			setText('');
		}

		return ()=>{
			stopped = true;
			stopFunc();
		}

	}, [ listening, lang, splitDelay, delay, handleText ]);

	return { error, text };
}

// Get transcript a bit more consistent accross web browsers
function normalizeTranscript(text: string) {
	// Trim
	text = text.trim();
	
	// Make first letter always uppercase
	text = text.charAt(0).toLocaleUpperCase() + text.slice(1);

	// Remove any "." at the end (-1 char on each sentence when using Edge)
	if(text.endsWith('.')) {
		text = text.slice(0,-1).trim();
	}

	return text;
}