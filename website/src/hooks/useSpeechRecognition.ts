import { useEffect, useState } from "react";
import { TranscriptData } from "../context/SocketContext";


/** Speech recognition using Web Speech API */
export function useSpeechRecognition(
	handleText: (transcript: TranscriptData) => void,
	lang: string,
	listening: boolean
) {
	const [error, setError] = useState<string>();

	useEffect(()=>{

		let stopFunc = ()=>{};
		let stopped = false;
		if(listening) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			if(!SpeechRecognition) {
				setError('Speech recognition not supported in this browser, try using Chrome or Edge');
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
				if(event.error !== 'aborted' && event.error !== 'no-speech') {
					setError('Speech recognition error : '+event.error);
					console.error('Speech recognition error', event.error);
				}
			}

			//Restart recognition when it ends itself
			recognition.onend = () => { if(!stopped) recognition.start(); }

			let lastIndex = -1;
			let start = Date.now();

			recognition.onresult = (event) => {
				// Get start time when new sentence
				if(lastIndex !== event.resultIndex) {
					lastIndex = event.resultIndex;
					start = Date.now();
				}
				const result = event.results[event.resultIndex];
				const text = result[0].transcript.trim();
				if(text) {
					const duration = Date.now() - start;
					handleText({text, lang, duration, delay: duration, final: result.isFinal });
					if(result.isFinal) {
						start = Date.now();
					}
				}
			}

			recognition.start();

			stopFunc = () =>{
				recognition.abort();
			}
		}

		return ()=>{
			stopped = true;
			stopFunc();
		}

	}, [ listening, lang, handleText ]);

	return { error };
}