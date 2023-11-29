import React, { useContext, useEffect, useState } from 'react';
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { speechLanguages } from './speechLanguages';
import { Action, SocketContext } from '../../context/SocketContext';

import FormResponse from '../FormResponse';

interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string | undefined) => void
    lastSpokenLang?: string
    configLoaded: boolean
    loadingImg: string
}

function MicrophoneApp({ spokenLang, setSpokenLang, lastSpokenLang, configLoaded, loadingImg }: MicrophoneAppProps) {
    const { handleText, info, reloadConfig, socket } = useContext(SocketContext);
    const [listening, setListening] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);

    // Delay between each partial captions
    const splitDelay = 2500;
    // Additional delay added to captions
    const delay = 1000;
    const { error, text } = useSpeechRecognition({handleText, lang: spokenLang, listening, splitDelay, delay});

    // Show error messages
    useEffect(()=>{
        if(info?.type === 'error') setListening(false);
        
        const errorMessage : string | undefined = error ?? info?.message;
        if(errorMessage) {
            setResponse({ isSuccess: false, message: errorMessage });
        }else{
            setResponse(null);
        }

    }, [info, error]);

    // Handle actions triggered from server
    useEffect(()=>{
        function handleAction(action: Action) {
            if(action.type === 'setlang') {
                setSpokenLang(action.lang);
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
