import { middleware, errorHandler } from "supertokens-node/framework/express";
import { verifySession } from "supertokens-node/recipe/session/framework/express";
import UserRoles from "supertokens-node/recipe/userroles";


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
