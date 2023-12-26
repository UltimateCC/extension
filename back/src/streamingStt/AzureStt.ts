import { AudioConfig, AudioInputStream, AutoDetectSourceLanguageConfig, CancellationErrorCode, CancellationReason, LanguageIdMode, PushAudioInputStream, ResultReason, SpeechConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import { StreamingSpeechToText } from "./StreamingSpeechToText";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { logger } from "../logger";

export class AzureStt extends StreamingSpeechToText {
	private speechRecognizer: SpeechRecognizer;
	private ffmpeg: ChildProcessWithoutNullStreams;
	private pushStream: PushAudioInputStream;

	ready() {
		//return !!(this.secrets.azureSttKey?.trim() && this.secrets.azureSttRegion?.trim() )
		return false;
	}

	async start() {
		this.stop();
		try {
			/*
			if( !this.ready() || !this.config.spokenLangs?.length ) {
				this.emit('info', {
					type: 'error',
					message: 'Invalid speech to text configuration'
				});
				return;
			}

			const speechConfig = SpeechConfig.fromSubscription(this.secrets.azureSttKey!, this.secrets.azureSttRegion!);
			
			const langsConfig = AutoDetectSourceLanguageConfig.fromLanguages(this.config.spokenLangs);
			langsConfig.mode = LanguageIdMode.Continuous;

			this.pushStream = AudioInputStream.createPushStream();
			const audioConfig = AudioConfig.fromStreamInput(this.pushStream);

			this.speechRecognizer = SpeechRecognizer.FromConfig(speechConfig, langsConfig, audioConfig);
			*/
			this.ffmpeg = spawn('ffmpeg', [
				'-i', '-',
				'-ar', '16000',
				// Filter to remove silences
				// '-af', 'silenceremove=start_periods=1:stop_periods=-1:start_threshold=-50dB:stop_threshold=-50dB:start_silence=2:stop_silence=2',
				'-f', 'wav',
				'-'
			]);

			/*
			this.ffmpeg.stderr.on('data', data=> {
				logger.debug('ffmpeg err', data.toString("utf8"));
			});*/
			
			this.ffmpeg.stdout.on('data', (arrayBuffer) => {
				this.pushStream.write(arrayBuffer.slice());
			}).on('end', () => {
				this.pushStream.close();
			});
			this.ffmpeg.stdin.on('error', e=>{});
			
			this.speechRecognizer.recognizing = (s, e) => {
				const duration = e.result.duration;
				const lang = e.result.language;
				const text = e.result.text.trim();
				if(text) {
					this.emit('transcript', { delay: duration, duration, lang, text, final: false });
				}
			};
			
			this.speechRecognizer.recognized = (s, e) => {
				if (e.result.reason === ResultReason.RecognizedSpeech) {
					const duration = e.result.duration;
					const lang = e.result.language;
					const text = e.result.text.trim();
					if(text) {
						this.emit('transcript', { delay: duration, duration, lang, text, final: true });
					}
				}
			};

			this.speechRecognizer.canceled = (s, e) => {
				if (e.reason == CancellationReason.Error) {

					if(e.errorCode === CancellationErrorCode.ConnectionFailure || e.errorCode === CancellationErrorCode.AuthenticationFailure ) {
						this.emit('info', {
							type: 'error',
							message: 'Error connecting to Azure Speech to Text service, ensure configuration is correct'
						});
					}else {
						logger.error('Azure unexpected STT error ', e.errorCode, e.errorDetails);
						this.emit('info', { type: 'error', message: 'Unexpected Azure Speech to Text error' });
					}
				}
				this.speechRecognizer.stopContinuousRecognitionAsync();
			};
			
			this.speechRecognizer.sessionStopped = (s, e) => {
				this.speechRecognizer.stopContinuousRecognitionAsync();
			};

			this.speechRecognizer.startContinuousRecognitionAsync();
		}catch(e) {
			this.emit('info', { type: 'error', message: 'Error starting speech to text service, try again later' });
			logger.error('Error starting azure stt service', e);
			this.stop();
		}
	}

	async stop() {
		this.speechRecognizer?.stopContinuousRecognitionAsync();
		this.ffmpeg?.kill('SIGKILL');
	}

	async handleData(data: Buffer) {
		try {
			if(this.ffmpeg?.stdin.writable) {
				this.ffmpeg.stdin.write(data);
			};
		}catch(e) {
			logger.error('Azure sst ffmpeg write error', e);
		}
	}
}