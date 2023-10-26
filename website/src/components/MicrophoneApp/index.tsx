import { useState, useEffect, useCallback } from 'react';

import api from '../../services/api';

import FormResponse from '../../components/FormResponse';
import DelayedDisplay from '../../components/DelayedDisplay';

interface MicrophoneAppProps {
    defaultSelectedMic: string | undefined;
    micLoaded: boolean;
}

function MicrophoneApp({ defaultSelectedMic, micLoaded }: MicrophoneAppProps) {
    const [microphoneDevices, setMicrophoneDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [permissionState, setPermissionState] = useState('prompt' as PermissionState);
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);
    const [isLoadingSend, setIsLoadingSend] = useState<boolean>(false);
    const [response, setResponse] = useState<{ isSuccess: boolean; message: string } | null>(null);
    const [selectedMic, setSelectedMic] = useState<string>('');

    let mediaRecorder: MediaRecorder | undefined;

    const checkPermission = useCallback(async () => {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionState(permissionStatus.state);
        if (permissionStatus.state === 'granted') getMicrophoneDevices();
    }, []);

    useEffect(() => {
        setSelectedMic(defaultSelectedMic || '');
    }, [defaultSelectedMic]);

    useEffect(() => {
        checkPermission();
    }, [checkPermission]);

    useEffect(() => {
        if (audioContext) {
            isMuted ? audioContext.suspend() : audioContext.resume();
        }
    }, [isMuted, audioContext]);

    const getMicrophoneDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        setMicrophoneDevices(audioDevices);
    };

    const sendMessage = (message: Blob) => {
        if (websocket) {
            websocket.send(message);
        } else {
            console.log("No websocket connection");
        }
    };    

    const stopListening = () => {
        if (audioContext) {
            audioContext.close();
            setAudioContext(null);
        }

        if (websocket) {
            websocket.close();
            setWebSocket(null);
        }
        setIsListening(false);
        setIsMuted(false);
    };

    const startListening = async () => {
        const selectedDeviceId = microphoneDevices[0]?.deviceId;
        if (!selectedDeviceId) {
            alert("No microphone selected.");
            return;
        }

        if (!websocket) {
            const newWebsocket = new WebSocket('ws://127.0.0.1:8765');

            newWebsocket.onopen = () => {
                setWebSocket(newWebsocket);
                console.log('WebSocket connection established');
            };

            newWebsocket.onclose = () => {
                setWebSocket(null);
                console.log('WebSocket connection closed');
            };

            newWebsocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }

        try {
            const newAudioContext = new AudioContext();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedDeviceId } });

            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.addEventListener("dataavailable", event => {
                sendMessage(event.data);
            });

            mediaRecorder.start();

            setAudioContext(newAudioContext);
        } catch (error) {
            alert("Error setting up audio: " + error);
        }

        setIsListening(true);
    };

    const toggleListening = () => {
        isListening ? stopListening() : startListening();
    };

    const toggleMute = () => {
        setIsMuted(prevMute => !prevMute);
    };

    const requestMicrophonePermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            getMicrophoneDevices();
            checkPermission();
        } catch (error) {
            console.error("Error requesting audio permission:", error);
        }
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
            {permissionState === 'granted' ? (
                <div>
                    {response && (
                        <FormResponse
                            isSucceed={response.isSuccess}
                            message={response.message}
                            onClose={closeResponse}
                        />
                    )}
                    <select className='theme-select microphone-devices' value={selectedMic} onChange={(e) => sendSelectedMic(e.target.value)} disabled={!micLoaded || isLoadingSend || isListening}>
                        {!micLoaded || isLoadingSend ? (
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

                        {isListening && (
                            <button className={`theme-btn mute ${isMuted ? 'muted' : ''}`} onClick={toggleMute} disabled={!isListening}>
                                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <button className="theme-btn requestButton" onClick={requestMicrophonePermission}><span>Request Permission</span></button>
            )}
        </>
    );
}

export default MicrophoneApp;
