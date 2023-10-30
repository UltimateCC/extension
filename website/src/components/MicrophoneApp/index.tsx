import React, { useContext, useState } from 'react';
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { speechLanguages } from './speechLanguages';
import api from '../../services/api';
import { CaptionsContext } from '../../context/SocketContext';


interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string) => void
}

function MicrophoneApp({ spokenLang, setSpokenLang }: MicrophoneAppProps) {

    const { handleText, recognized } = useContext(CaptionsContext);
    const [listening, setListening] = useState<boolean>(false);
    const { error } = useSpeechRecognition(handleText, spokenLang!, listening);

    function handleSpokenLang(event: React.ChangeEvent<HTMLSelectElement>) {
        setSpokenLang(event.target.value);
        api('config', {
            method: 'POST',
            body: { spokenLang: event.target.value }
        }).catch(e=>console.error('Error updating spoken language',e));
    }

    return (
        <>
            { error }
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
            
        </>
    );
}

export default MicrophoneApp;
