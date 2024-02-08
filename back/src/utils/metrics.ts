import client from 'prom-client';
import express from "express";
import { environment } from './environment';
import { logger } from './logger';
import { createServer } from 'http';

const register = new client.Registry();

// Default label added to all metrics
register.setDefaultLabels({
	app: 'ultimatecc'
});

client.collectDefaultMetrics({ register });

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
