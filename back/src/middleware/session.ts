import { middleware, errorHandler, SessionRequest } from "supertokens-node/framework/express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import UserRoles from "supertokens-node/recipe/userroles";
import Session from "supertokens-node/recipe/session";
import { NextFunction, Response } from "express";


export const supertokenMiddleware = middleware();

export const supertokenErrorHandler = errorHandler();

/** Middleware to load session */
export const loadSessionMiddleware = verifySession({sessionRequired: false});

/** Middleware to require a user to be logged in */
export const authMiddleware = verifySession();

/** Middleware to require a user to be admin */
export const adminMiddleware = verifySession({
	overrideGlobalClaimValidators: async (globalValidators) => [
		...globalValidators,
		UserRoles.UserRoleClaim.validators.includes('admin')
	]
});

/** Socketio middleware to handle auth errors and trigger token refresh when necessary */
export const socketioSessionMiddleware = async (req: SessionRequest, res: Response, next: NextFunction) => {
	try {
		req.session = await Session.getSession(req, res, { sessionRequired: false });
		next();
	} catch (err) {
		errorHandler()(err, req, res, next);
	}
}
