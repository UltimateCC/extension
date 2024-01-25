import client from 'prom-client';
import express from "express";
import { environment } from './environment';
import { logger } from './logger';

const register = new client.Registry();

// Default label added to all metrics
register.setDefaultLabels({
	app: 'ultimatecc'
});

client.collectDefaultMetrics({ register });

const metricsServer = express();

metricsServer.get('/metrics', async (req, res, next)=>{
	try{
		res.set('Content-Type', register.contentType);
		res.end(await register.metrics());
	}catch(e) {
		logger.error('Error fetching metrics', e);
		res.sendStatus(500);
	}
});

export async function startMetricsServer() {
	await new Promise<void>((res)=>{
		metricsServer.listen(environment.METRICS_PORT, ()=>{
			res();
		});
	});
}
