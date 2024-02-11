import client from 'prom-client';
import express from "express";
import { environment } from './environment';
import { logger } from './logger';
import { createServer } from 'http';

const register = client.register;

// Default label added to all metrics
register.setDefaultLabels({
	app: 'ultimatecc'
});

client.collectDefaultMetrics();

const metricsApp = express();

metricsApp.get('/metrics', async (req, res, next)=>{
	try{
		res.set('Content-Type', register.contentType);
		res.end(await register.metrics());
	}catch(e) {
		logger.error('Error fetching metrics', e);
		res.sendStatus(500);
	}
});

const metricsServer = createServer(metricsApp);

export async function startMetricsServer() {
	await new Promise<void>((res)=>{
		metricsServer.listen(environment.METRICS_PORT, ()=>res());
	});
}

export async function stopMetricsServer() {
	await new Promise<void>((res)=>{
		metricsServer.close(()=>res());
	});
}

export const metrics = {
	sentenceTotal: new client.Counter({
		name: 'captions_sentence_total',
		help: 'Total transcript sentence count',
		labelNames: ["final"]
	}),

	charTotal: new client.Counter({
		name: 'captions_char_total',
		help: 'Total transcript character count',
		labelNames: ["final"]
	}),

	translatedCharTotal: new client.Counter({
		name: 'captions_translated_total',
		help: 'Total translated caracters count',
	}),

	captionsDelay: new client.Histogram({
		name: 'captions_delay_seconds',
		help: 'Captions delay just before being sent',
		buckets: client.linearBuckets(-2, .5, 12),
		labelNames: ["final"]
	}),

	connectionCount: new client.Gauge({
		name: 'captions_connections_count',
		help: 'Count of connected socketio clients',
	}),

	gcpRequests: new client.Counter({
		name: 'captions_gcp_requests_total',
		help: 'Total count of Google API requests',
		labelNames: ['status']
	}),

	pubsubErrors: new client.Counter({
		name: 'captions_pubsub_errors_total',
		help: 'Total count of Twitch pubsub API errors',
	}),

	liveChannels: new client.Gauge({
		name: 'captions_live_channels_count',
		help: 'Count of live channels',
	}),

	liveViewers: new client.Gauge({
		name: 'captions_live_viewers_count',
		help: 'Count of viewers on live channels',
	}),

	translateChannels: new client.Gauge({
		name: 'captions_live_translate_channel_count',
		help: 'Count of channels with translation enabled',
	}),

	translateLangs: new client.Gauge({
		name: 'captions_live_translate_langs_count',
		help: 'Count of channels with translation enabled',
	}),
}
