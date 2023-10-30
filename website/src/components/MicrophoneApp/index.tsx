import React, { useContext, useEffect, useState } from 'react';
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { speechLanguages } from './speechLanguages';
import api from '../../services/api';
import { SocketContext } from '../../context/SocketContext';


interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string) => void
    configLoaded: boolean
    loadingImg: string
}

function MicrophoneApp({ spokenLang, setSpokenLang, configLoaded, loadingImg }: MicrophoneAppProps) {
    const { handleText, recognized, info, reloadConfig } = useContext(SocketContext);
    const [listening, setListening] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const { error } = useSpeechRecognition(handleText, spokenLang!, listening);

    useEffect(()=>{
        if(info?.type === 'error') {
            setListening(false);
        }
        setErrorMessage(error ?? info?.message);

    }, [info, error]);

    function handleSpokenLang(event: React.ChangeEvent<HTMLSelectElement>) {
        setSpokenLang(event.target.value);
        api('config', {
            method: 'POST',
            body: { spokenLang: event.target.value }
        })
        .then(reloadConfig)
        .catch(e=>console.error('Error updating spoken language', e));
    }

    if (!configLoaded) return (
        <img src={loadingImg} alt="loading" className="loading-img" />
    );

    return (
        <>
            { errorMessage }
            <div className="setting-options">
                <select className="theme-select" value={spokenLang} onChange={ handleSpokenLang }>
                    <option value="">Spoken language</option>
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
                        <p>{ recognized?.text ?? '' } </p>
                    </div>
                </>
            )}
            
        </>
    );
}

export default MicrophoneApp;
