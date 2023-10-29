import React, { useState, useEffect } from 'react';
import { startSpeechRecognition } from "../../record/speechRecognition";
import { speechLanguages } from '../../record/speechLanguages';
import api from '../../services/api';


interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string) => void
    handleText: (transcript: { text: string, lang: string, duration: number }) => void
    recognized?: { text: string, lang: string }
}

function MicrophoneApp({ handleText, recognized, spokenLang, setSpokenLang }: MicrophoneAppProps) {

    const [listening, setListening] = useState<boolean>(false);

    //todo maybe: useSpeechRecognition Hook
    useEffect(()=>{
        let stopFunc = ()=>{};
        let stopped = false;
        if(listening && spokenLang) {
            startSpeechRecognition(handleText, spokenLang)
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
    }, [listening, spokenLang, handleText]);

    function handleSpokenLang(event: React.ChangeEvent<HTMLSelectElement>) {
        setSpokenLang(event.target.value);
        api('config', {
            method: 'POST',
            body: { spokenLang: event.target.value }
        }).catch(e=>console.error('Error updating spoken language',e));
    }

    return (
        <div>
            <div className="setting-options">
                <select className="theme-select" value={spokenLang} onChange={ handleSpokenLang }>
                    { speechLanguages.map(lang => ( <option value={lang.code} key={lang.code}>{lang.name}</option> ) ) }
                </select>
                <button className={`theme-btn listening ${listening ? '' : 'start-btn'}`} onClick={()=>{ setListening(!listening) }}>
                    <span>{listening ? 'Stop listening' : 'Start listening'}</span>
                </button>
            </div>

            {listening && (
                <>
                    <h4>Spoken text</h4>
                    <div className="spoken-text">
                        <p>{ recognized?.text ?? ''}</p>
                    </div>
                </>
            )}
            
        </div>
    );
}

export default MicrophoneApp;
