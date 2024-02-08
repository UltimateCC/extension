import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const errorMiddleware = (req: Request, res: Response, next: NextFunction, err: unknown) => {
	if(res.headersSent) {
		return next(err);
	}
	logger.error(`API Error on route ${req.path}`, err);

	res.status(500).json({ message: 'Server error' });
};
