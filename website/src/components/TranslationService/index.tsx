import React, { useContext, useRef, useState } from 'react';

import api from '../../services/api';

import FormResponse from '../FormResponse';
import DelayedDisplay from '../DelayedDisplay';

import { SocketContext } from '../../context/SocketContext';
import { config } from '../../config';

interface TranslationServiceProps {
    translateService?: string
    configLoaded: boolean
    loadingImg: string
}

function TranslationService({ translateService, configLoaded, loadingImg }: TranslationServiceProps) {
    const { captionsStatus, reloadConfig } = useContext(SocketContext);

    const apiKeyInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoadingSend, setIsLoadingSend] = useState<boolean>(false);
    const [isLoadingRemove, setIsLoadingRemove] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);


    const sendApiKey = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newApiKey = apiKeyInputRef.current?.value;

        if (isLoadingSend || !newApiKey) return;
        
        setIsLoadingSend(true);

        DelayedDisplay({
            requestFn: async () => {
                await api("https://translation.googleapis.com/language/translate/v2", {
                        params: {
                            key: newApiKey,
                            q: 'Hi',
                            source: 'en',
                            target: 'fr' // Cocorico
                        }
                    },
                    false
                )
            },
            successMessage: "The API key is working and has been saved", 
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingSend,
            setResponse: setResponse,
            apiRequest: async () => {
                await Promise.all([
                    api('secrets', { method: 'POST', body: { gcpKey: newApiKey } }),
                    api('config', {method: 'POST', body: { translateService: 'gcp' }})
                ]);
                reloadConfig();
            }
        });
    };

    const removeApiKey = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (isLoadingRemove) return;

        setIsLoadingRemove(true);

        DelayedDisplay({
            requestFn: async () => {
                await Promise.all([
                    api('secrets', { method: 'POST', body: { gcpKey: '' } }),
                    api('config', {method: 'POST', body: { translateService: '' }})
                ]);
                reloadConfig();
            },
            successMessage: "The API key has been removed", 
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingRemove,
            setResponse: setResponse,
            setSuccessAction: () => {
                setIsEditing(false);
            }
        });
    };

    const closeResponse = () => {
        setResponse(null);
    };

    if (!configLoaded || !captionsStatus) return (
        <img src={loadingImg} alt="loading" className="loading-img" />
    );

    if(translateService && captionsStatus?.translation && !isEditing) return (
        <>
            {response && (
                <FormResponse
                    isSucceed={response.isSuccess}
                    message={response.message}
                    onClose={closeResponse}
                />
            )}
            <div className="api-connected">
                <h4>Connected!</h4>
                <button className="theme-btn" onClick={() => setIsEditing(true)}><span>Change</span></button>
            </div>
        </>
    );

    return (
        <div className='api'>
            <p>
                In this first version, translation is only available using Google Translation API
                and requires you to create a Google Cloud account and provide your own API key.
            </p>
            <p>
                Simpler ways to enable translation will be available later.
            </p>
            <form className='api-form'>
                <p>Warning ! When using your own API keys, you are responsible for setting proper limits to avoid any unexpected billing</p>
                {response && (
                    <FormResponse
                        isSucceed={response.isSuccess}
                        message={response.message}
                        onClose={closeResponse}
                    />
                )}
                <div className="api-input">
                    <input
                        ref={apiKeyInputRef}
                        type="password"
                        className="theme-input"
                        placeholder="Enter the api key..."
                    />
                    <button className="theme-btn" onClick={sendApiKey} type="submit">
                        <span>{isLoadingSend ? 'Sending...' : 'Send'}</span>
                    </button>
                </div>
            </form>
            <div className='api-info'>
                <a href={ config.github + '/wiki/Configure-translation' } target="_blank" rel="noreferrer">
                    &rarr; Get your Google API key
                </a>
                
                {isEditing && (
                    <button className="theme-btn danger-btn" onClick={removeApiKey} type="submit">
                        <span>{isLoadingRemove ? 'Removing...' : 'Remove my API key'} </span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default TranslationService;
