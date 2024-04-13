import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { TranscriptData, TypedSocket } from "../context/SocketContext";

const socket: TypedSocket = io({autoConnect: false});

export function useSocket(connect: boolean) {
    const [socketError, setSocketError] = useState<string|undefined>();

    useEffect(() => {
        function handleConnect() {
            setSocketError(undefined);
        }

        function handleError(error: Error) {
            console.error('socket.io error', error);
            setSocketError('Connection error, you may need to refresh the page');
        }
        
        if(connect) {
            socket.connect();

            socket.on('connect', handleConnect);
            socket.on('connect_error', handleError);

            return () => {
                socket.off('connect', handleConnect);
                socket.off('connect_error', handleError);
                socket.disconnect();
            }            
        }
    }, [connect]);

    // Trigger a server side config reload
    const reloadConfig = useCallback(()=>{
        // Reset error message
        setSocketError(undefined);
        // Clear buffered events
        socket.sendBuffer = [];

        socket.emit('reloadConfig');
    }, []);

    // Handle text from speech recognition
    const handleText = useCallback((transcript: TranscriptData ) => {
        socket.emit('text', transcript);
    }, []);

    return {
            socket,
            socketError,
            reloadConfig,
            handleText,
    };
}
