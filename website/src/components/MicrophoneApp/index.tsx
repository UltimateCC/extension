import { useState, useEffect } from 'react';

import api from '../../services/api';

import FormResponse from '../../components/FormResponse';
import DelayedDisplay from '../../components/DelayedDisplay';

interface MicrophoneAppProps {
    defaultSelectedMic: string | undefined;
}

function MicrophoneApp({ defaultSelectedMic }: MicrophoneAppProps) {
    const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
    const [isLoadingSend, setIsLoadingSend] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);
    const [selectedMic, setSelectedMic] = useState<string>('');

    //todo
    const isListening = false;

    useEffect(()=>{
        getMicrophoneDevices();
    }, []);

    useEffect(() => {
        setSelectedMic(defaultSelectedMic || '');
    }, [defaultSelectedMic]);

    const getMicrophoneDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        setMicrophoneDevices(audioDevices);
    };  

    const stopListening = () => {

    };

    const startListening = () => {
        
    };

    const toggleListening = () => {
        isListening ? stopListening() : startListening();
    };

    const sendSelectedMic = (newMic: string) => {
        if (isLoadingSend) return;

        setIsLoadingSend(true);

        DelayedDisplay({
            requestFn: async () => {
                await api('user', {
                    method: 'POST',
                    body: { mic_settings: newMic }
                });

            },
            successMessage: "The microphone has been saved",
            errorMessage: "An error occurred",
            setIsLoading: setIsLoadingSend,
            setResponse: setResponse,
            setSuccessAction: () => {
                setSelectedMic(newMic);
            },
        });        
    };

    const closeResponse = () => {
        setResponse(null);
    };

    return (
        <>
            <div>
                {response && (
                    <FormResponse
                        isSucceed={response.isSuccess}
                        message={response.message}
                        onClose={closeResponse}
                    />
                )}
                <select className='theme-select microphone-devices' value={selectedMic} onChange={(e) => sendSelectedMic(e.target.value)} disabled={isLoadingSend || isListening}>
                    { isLoadingSend ? (
                        <option>Loading...</option>
                    ) : (microphoneDevices.map(device => (
                        <option key={device.deviceId} value={device.deviceId} className='custom-option'>
                            {device.label || `Microphone ${microphoneDevices.indexOf(device) + 1}`}
                        </option>
                    )))}
                </select>
                <div className="setting-options">
                    <button className={`theme-btn listening ${isListening ? 'start' : ''}`} onClick={toggleListening}>
                        <span>{isListening ? 'Stop listening' : 'Start listening'}</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default MicrophoneApp;
