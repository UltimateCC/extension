import React, { useContext, useEffect, useState } from 'react';
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { speechLanguages } from './speechLanguages';
import { Action, SocketContext } from '../../context/SocketContext';

import FormResponse from '../FormResponse';

interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string) => void
    lastSpokenLang?: string
    configLoaded: boolean
    loadingImg: string
}

function MicrophoneApp({ spokenLang, setSpokenLang, lastSpokenLang, configLoaded, loadingImg }: MicrophoneAppProps) {
    const { handleText, info, reloadConfig, socket } = useContext(SocketContext);
    const [listening, setListening] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);
    const { error, text } = useSpeechRecognition(handleText, spokenLang!, listening);

    // Show error messages
    useEffect(()=>{
        if(info?.type === 'error') setListening(false);
        
        const errorMessage : string | undefined = error ?? info?.message;
        if(errorMessage) setResponse({ isSuccess: false, message: errorMessage });

    }, [info, error]);

    // Handle actions triggered from server
    useEffect(()=>{
        function handleAction(action: Action) {
            if(action.type === 'setlang') {
                if(action.lang) {
                    setSpokenLang(action.lang ?? lastSpokenLang);
                }
            }else if(action.type === 'start') {
                setListening(true);
            }else if(action.type === 'stop') {
                setListening(false);
            }
        }

        socket.on('action', handleAction);

        return ()=>{
            socket.off('action', handleAction);
        }
    }, [socket, reloadConfig, setSpokenLang, spokenLang, lastSpokenLang]);

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

            {listening && (
                <>
                    <h4>Spoken text</h4>
                    <div className="spoken-text">
                        <p>{ text } </p>
                    </div>
                </>
            )}
            
        </>
    );
}

export default MicrophoneApp;
