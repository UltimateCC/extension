
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

export type CaptionsData = {
	delay: number
	duration: number
	captions: TranscriptAlt[]
}

export type Info = {
	type: 'warn' | 'error' ,
	message: string
}