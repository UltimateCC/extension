import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { CaptionsStatus, Info, LangList, TranscriptAlt } from "../context/SocketContext";

type CaptionsData = {
    delay: number
    duration: number
    captions: TranscriptAlt[]
}

interface ServerToClientEvents {
    translateLangs: (langs: LangList) => void;
    info: ( info: Info ) => void;
    status: ( status: CaptionsStatus ) => void;
    transcript: ( transcript: TranscriptAlt )=>void;
}

interface ClientToServerEvents {
    reloadConfig: () => void;
    text: (text: CaptionsData) => void;
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

        socket.on('connect_error', e=>{
            console.error('socket.io error', e);
        });

        socket.on('info', info=>{
            setInfo(info);
        });

        socket.on('status', status=>{
            setCaptionsStatus(status);
        });

        socket.on('transcript', transcript=>{
            setRecognized(transcript);
        });

        socket.on('translateLangs', translateLangs=>{
            setTranslateLangs(translateLangs);
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    function reloadConfig() {
        socket.emit('reloadConfig');
        setInfo(undefined);
    }

    // Handle text from speech recognition
    function handleText(transcript: { text: string, lang: string, duration: number } ) {
        socket.emit('text', {
            delay: transcript.duration, duration: transcript.duration,
            captions: [ { text: transcript.text, lang: transcript.lang } ]
        });
    }

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

    return (
        {
            info,
            captionsStatus,
            translateLangs,
            recognized,
            reloadConfig,
            handleText,
        }
    );
}
