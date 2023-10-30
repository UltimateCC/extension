import React, { useContext, useEffect, useState } from 'react';
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { speechLanguages } from './speechLanguages';
import api from '../../services/api';
import { SocketContext } from '../../context/SocketContext';

import FormResponse from '../FormResponse';

interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string) => void
    configLoaded: boolean
    loadingImg: string
}

function MicrophoneApp({ spokenLang, setSpokenLang, configLoaded, loadingImg }: MicrophoneAppProps) {
    const { handleText, recognized, info, reloadConfig } = useContext(SocketContext);
    const [listening, setListening] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);
    const { error } = useSpeechRecognition(handleText, spokenLang!, listening);

    useEffect(()=>{
        if(info?.type === 'error') setListening(false);
        
        const errorMessage : string | undefined = error ?? info?.message;
        if(errorMessage) setResponse({ isSuccess: false, message: errorMessage });

    }, [info, error]);

    function handleSpokenLang(event: React.ChangeEvent<HTMLSelectElement>) {
        setSpokenLang(event.target.value);
        api('config', {
            method: 'POST',
            body: { spokenLang: event.target.value }
        })
        .then(reloadConfig)
        .catch((error) => {
            console.error('Error updating spoken language', error);
            setResponse({ isSuccess: false, message: 'An error occurred while updating your spoken language' });
        });
    }

    if (!configLoaded) return (
        <img src={loadingImg} alt="loading" className="loading-img" />
    );

    const closeResponse = () => {
        setResponse(null);
    };

    return (
        <>
            {response && (
                <FormResponse
                    isSucceed={response.isSuccess}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}
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
