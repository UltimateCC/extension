
/** Utility type to allow returning an error without throwing it */
export type Result<T> = {
	isError: true
	message: string
} | {
	isError: false
	errors?: string[]
	data: T
}

export interface CaptionsStatus {
	stt?: boolean,
	translation?: boolean,
	twitch?: boolean
}

export type LangList = {
	code: string
	name: string
}[]

export interface TranscriptAlt {
	text: string
	lang: string
}

interface Metadata {
	delay: number
	duration: number
	final: boolean
}

export type TranscriptData = Metadata & TranscriptAlt

export type CaptionsData = Metadata & {
	captions: TranscriptAlt[]
}

export interface Info {
	type: 'warn' | 'error' ,
	message: string
}

export interface Action {
	type: 'setlang' | 'start' | 'stop',
	lang?: string
}