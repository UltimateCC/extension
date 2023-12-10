import { EventSubMiddleware } from "@twurple/eventsub-http";
import { api } from "./twitch";
import { environment } from "../environment";
import { logger } from "../logger";


export const eventsub = new EventSubMiddleware({
	apiClient: api,
	pathPrefix: '/api/eventsub',
	hostName: environment.TWITCH_EVENTSUB_HOST,
	secret: environment.TWITCH_EVENTSUB_SECRET
});

// Log errors
eventsub.onSubscriptionCreateFailure( (subscription, error)=>{
	logger.error('Eventsub subscription create failure', error);
});

eventsub.onSubscriptionDeleteFailure( (subscription, error)=>{
	logger.error('Eventsub subscription delete failure', error);
});