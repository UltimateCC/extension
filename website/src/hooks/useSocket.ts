import { useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import { TranscriptData, TypedSocket } from "../context/SocketContext";

const socket: TypedSocket = io({autoConnect: false});

export function useSocket(connect: boolean) {

    useEffect(() => {
        if(connect) {
            socket.connect();
            return () => {
                socket.disconnect();
            }            
        }
    }, [connect]);

    // Trigger a server side config reload
    const reloadConfig = useCallback(()=>{
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
            reloadConfig,
            handleText,
    };
}
