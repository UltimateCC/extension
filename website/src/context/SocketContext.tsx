import { createContext } from "react"


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
}

export type TranscriptData = Metadata & TranscriptAlt

export interface SocketContextType {
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