import { useState, useEffect } from 'react';
import { startSpeechRecognition } from "../../record/speechRecognition";


interface MicrophoneAppProps {
    handleText: (transcript: { text: string, lang: string, duration: number }) => void
    recognized?: { text: string, lang: string }
}

function MicrophoneApp({ handleText, recognized }: MicrophoneAppProps) {

    const [listening, setListening] = useState<boolean>(false);

    useEffect(()=>{
        let stopFunc = ()=>{};
        let stopped = false;
        if(listening) {
            startSpeechRecognition(handleText, 'fr-FR')
            .then((cb)=>{
                if(stopped) {
                    cb();
                }else{
                    stopFunc = cb;
                }
            }).catch(e=>console.error('Error starting speech recogniton', e));
        }
        return ()=>{
            stopped = true;
            stopFunc();
        }
    }, [listening, handleText]);

    const toggleListening = () => {
        setListening(!listening);
    };

    return (
        <div>
            <div className="setting-options">
                <button className={`theme-btn listening ${listening ? 'start' : ''}`} onClick={toggleListening}>
                    <span>{listening ? 'Stop listening' : 'Start listening'}</span>
                </button>
            </div>
            <div>{ recognized?.text ?? ''}</div>
        </div>
    );
}

export default MicrophoneApp;
