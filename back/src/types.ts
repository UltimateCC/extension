
/** Utility type to allow returning an error without throwing it */
export type Result<T extends object> = {
	isError: true
	message: string
} | {
	isError: false
	errors?: string[]
} & T

export interface TranscriptAlt {
	text: string
	lang: string
}

interface Metadata {
	delay: number
	duration: number
	final: boolean
	lineEnd?: boolean
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
