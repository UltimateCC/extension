import { createContext } from "react"
import { Socket } from "socket.io-client"


export type CaptionsStatus = {
    stt?: boolean,
    translation?: boolean,
    twitch?: boolean
}

export type Info = {
    type: 'warn' | 'error' ,
    message: string
}

export type LangList = {
    code: string
    name: string
}[]

export type TranscriptAlt = {
    text: string
    lang: string
}

type Metadata = {
	delay: number
	duration: number
    final: boolean
	lineEnd: boolean
}

export type TranscriptData = Metadata & TranscriptAlt

export type Action = {
	type: 'setlang' | 'start' | 'stop',
	lang?: string
}

interface ServerToClientEvents {
    translateLangs: (langs: LangList) => void;
    info: ( info: Info ) => void;
    status: ( status: CaptionsStatus ) => void;
    transcript: ( transcript: TranscriptData )=>void;
	action: (action: Action)=>void;
}

interface ClientToServerEvents {
    reloadConfig: () => void;
    text: (text: TranscriptData) => void;
    /*
    audioStart: () => void;
    audioData: (data: Blob) => void;
    audioEnd: () => void;
    */
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface SocketContextType {
    socket: TypedSocket,
    info?: Info
    captionsStatus?: CaptionsStatus
    recognized?: TranscriptAlt
    recognizing?: TranscriptAlt
    translateLangs: LangList
    reloadConfig: () => void
    handleText: (transcript: TranscriptData ) => void
} 

export const SocketContext = createContext<SocketContextType>(
    {} as SocketContextType
);