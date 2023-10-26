import React, { useRef, useState } from 'react';

import api from '../../services/api';

import FormResponse from '../../components/FormResponse';
import DelayedDisplay from '../../components/DelayedDisplay';

interface ApiProps {
    apiKeyIsWorking: boolean;
    apiLoader: string | undefined;
    onApiKeyChange: (newApiKey: boolean) => void;
}

function Api({ apiKeyIsWorking, apiLoader, onApiKeyChange }: ApiProps) {
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
            setSuccessAction: () => onApiKeyChange(true),
            apiRequest: async () => {
                await api('user', {
                    method: 'POST',
                    body: { api_token: newApiKey }
                });
            }
        });
        
    };

    const removeApiKey = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (isLoadingRemove) return;

        setIsLoadingRemove(true);

        DelayedDisplay({
            requestFn: async () => {
                await api('user', {
                    method: 'POST',
                    body: { api_token: "" }
                });
            },
            successMessage: "The API key has been removed", 
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingRemove,
            setResponse: setResponse,
            setSuccessAction: () => {
                onApiKeyChange(false);
                setIsEditing(false);
            }
        });
    };

    const closeResponse = () => {
        setResponse(null);
    };

    if (apiLoader) return (
        <img src={apiLoader} alt="loading" className="loading-img" />
    );

    
    if(apiKeyIsWorking && !isEditing) return (
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
        <>
            <form className='api-form'>
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
                <a href="https://console.cloud.google.com/apis/library/translate.googleapis.com" target="_blank" rel="noreferrer">&rarr; Get your Google API key
                </a>
                
                {isEditing && (
                    <button className="theme-btn danger-btn" onClick={removeApiKey} type="submit">
                        <span>{isLoadingRemove ? 'Removing...' : 'Remove my API key'} </span>
                    </button>
                )}
            </div>
        </>
    );
}

export default Api;
