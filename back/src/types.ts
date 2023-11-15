
/** Utility type to allow returning an error without throwing it */
export type Result<T> = {
	isError: true,
	message: string
} | {
	isError: false,
	data: T
}

export type CaptionsStatus = {
	stt?: boolean,
	translation?: boolean,
	twitch?: boolean
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

export type CaptionsData = Metadata & {
	captions: TranscriptAlt[]
}

export type Info = {
	type: 'warn' | 'error' ,
	message: string
}

export type Action = {
	type: 'setlang' | 'start' | 'stop',
	lang?: string
}