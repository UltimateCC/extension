import { NextFunction, Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
	points: 15, // 15 requests
	duration: 1, // per second per IP
	blockDuration: 10
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
	rateLimiter.consume(req.ip!)
	.then(() => {
		next();
	}).catch(() => {
		res.status(429).send('Too Many Requests');
	});
};