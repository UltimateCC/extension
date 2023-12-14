import React, { useContext, useEffect, useState } from 'react';
import { speechLanguages } from './speechLanguages';
import { SocketContext } from '../../context/SocketContext';

import FormResponse from '../FormResponse';

interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string | undefined) => void
    configLoaded: boolean
    loadingImg: string
    listening: boolean
    setListening: (listening: boolean)=>void
    text: string
    recognitionErrror?: string
}

function MicrophoneApp({ spokenLang, setSpokenLang, setListening, listening, configLoaded, text, loadingImg, recognitionErrror }: MicrophoneAppProps) {
    const { info } = useContext(SocketContext);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);

    // Show error messages
    useEffect(()=>{
        if(info?.type === 'error') setListening(false);
        
        const errorMessage : string | undefined = recognitionErrror ?? info?.message;
        if(errorMessage) {
            setResponse({ isSuccess: false, message: errorMessage });
        }else{
            setResponse(null);
        }

    }, [info, recognitionErrror, setListening]);

    function handleSpokenLang(event: React.ChangeEvent<HTMLSelectElement>) {
        setSpokenLang(event.target.value);
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

            { (
                <>
                    <h4>Recognized text</h4>
                    <div className="spoken-text">
                        <p>{ text } </p>
                    </div>
                </>
            )}
            
        </>
    );
}

export default MicrophoneApp;
