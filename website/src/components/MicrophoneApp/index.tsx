import React, { useContext, useEffect, useState } from 'react';
import { speechLanguages } from './speechLanguages';
import { Info, SocketContext } from '../../context/SocketContext';

import Alert from '../Alert';

interface MicrophoneAppProps {
    spokenLang?: string
    setSpokenLang: (spokenLang: string | undefined) => void
    configLoaded: boolean
    loadingImg: string
    listening: boolean
    setListening: (listening: boolean) => void
    text: string
    recognitionErrror?: string
}

function MicrophoneApp({ spokenLang, setSpokenLang, setListening, listening, configLoaded, text, loadingImg, recognitionErrror }: MicrophoneAppProps) {
    const { reloadConfig, socket } = useContext(SocketContext);
    const [response, setResponse] = useState<{ type: 'error'|'warning', message: string } | null>(null);

    // Show speech recognition error messages
    useEffect(() => {
        if(recognitionErrror) {
            setResponse({type: 'error', message: recognitionErrror });
        }else{
            setResponse(null);
        }
    }, [recognitionErrror]);

    // Show error messages received via socket
    useEffect(() => {
        function handleInfo(info: Info) {
            if(info.type === 'warn') {
                setResponse({type: 'warning', message: info.message});
            }else if(info.type === 'error') {
                setResponse({type: 'error', message: info.message});
            }
        }
        socket.on('info', handleInfo);

        return () => {
            socket.off('info', handleInfo);
        }
    }, [recognitionErrror, socket]);

    // Stop listening if there is an error
    useEffect(() => {
        if(response?.type === 'error') {
            setListening(false);
        }
    }, [response, setListening]);
    

    function handleSpokenLang(event: React.ChangeEvent<HTMLSelectElement>) {
        setSpokenLang(event.target.value);
    }

    if (!configLoaded) return (
        <img src={loadingImg} alt="loading" className="loading-img" />
    );

    const closeResponse = () => {
        setResponse(null);
    };

    function toggleListening() {
        // Reload when starting captions
        if(!listening) {
            reloadConfig();
        }
        setListening(!listening);
    }

    return (
        <>
            {response && (
                <Alert
                    type={(response.type)}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}
            <div className="setting-options">
                <select className="theme-select" value={spokenLang} onChange={ handleSpokenLang }>
                    <option value="">Spoken language</option>
                    { speechLanguages.map(lang => ( <option value={lang.code} key={lang.code}>{lang.name}</option> ) ) }
                </select>
                <button className={`theme-btn listening ${listening ? '' : 'start-btn'}`} onClick={toggleListening}>
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
