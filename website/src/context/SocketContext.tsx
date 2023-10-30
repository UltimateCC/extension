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

export interface SocketContextType {
    info?: Info
    captionsStatus?: CaptionsStatus
    recognized?: TranscriptAlt
    translateLangs: LangList
    reloadConfig: () => void
    handleText: (transcript: { text: string, lang: string, duration: number } ) => void
} 

export const SocketContext = createContext<SocketContextType>(
    {} as SocketContextType
);