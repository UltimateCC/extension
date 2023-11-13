import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CaptionsStatus, Info, LangList, TranscriptAlt, TranscriptData } from "../context/SocketContext";

interface ServerToClientEvents {
    translateLangs: (langs: LangList) => void;
    info: ( info: Info ) => void;
    status: ( status: CaptionsStatus ) => void;
    transcript: ( transcript: TranscriptData )=>void;
}

interface ClientToServerEvents {
    reloadConfig: () => void;
    text: (text: TranscriptData) => void;
    audio: (data: Blob, duration: number) => void;
    audioStart: () => void;
    audioData: (data: Blob) => void;
    audioEnd: () => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({autoConnect: false});


export function useSocket() {
    const [info, setInfo] = useState<Info>();
    const [captionsStatus, setCaptionsStatus] = useState<CaptionsStatus>();
    const [translateLangs, setTranslateLangs] = useState<LangList>([]);
    // Recognized text
    const [recognized, setRecognized] = useState<TranscriptAlt>();

    useEffect(() => {
        socket.connect();

        function handleError(error: Error) {
            console.error('socket.io error', error);
            setInfo({ type: 'warn', message: 'Connection error, you may need to refresh the page' });
        }

        function handleTranscript(transcript: TranscriptData) {
            setRecognized({ lang: transcript.lang, text: transcript.text });
        }

        socket.on('connect_error', handleError);
        socket.on('info', setInfo);
        socket.on('status', setCaptionsStatus);
        socket.on('translateLangs', setTranslateLangs);
        socket.on('transcript', handleTranscript);

        return () => {
            socket.off('connect_error', handleError);
            socket.off('info', setInfo);
            socket.off('status', setCaptionsStatus);
            socket.off('translateLangs', setTranslateLangs);
            socket.off('transcript', handleTranscript);
            socket.disconnect();
        }
    }, []);

    // Trigger a server side config reload
    const reloadConfig = useCallback(()=>{
        socket.emit('reloadConfig');
        setInfo(undefined);
    }, []);

    // Handle text from speech recognition
    const handleText = useCallback((transcript: TranscriptData ) => {
        socket.emit('text', transcript);
    }, []);

    /*
    // Handle sending audio as recording
    function handleRecord(data: Blob, duration: number) {
        socket.emit('audio', data, duration);
    }*/

    /*
    // Handle sending audio as stream
    function handleAudioStart() {
        socket.emit('audioStart');
    }

    function handleAudioEnd() {
        socket.emit('audioEnd');
    }

    function handleAudioData(data: Blob) {
        socket.emit('audioData', data);
    }
    */

    return {
            socket,
            info,
            captionsStatus,
            translateLangs,
            recognized,
            reloadConfig,
            handleText,
    };
}
