import { EventSubMiddleware } from "@twurple/eventsub-http";
import { api } from "./twitch";
import { environment } from "../config/environment";
import { logger } from "../config/logger";
import { User } from "../entity/User";
import { io } from "../socketioServer";


export const eventsub = new EventSubMiddleware({
	apiClient: api,
	pathPrefix: '/api/eventsub',
	hostName: environment.TWITCH_EVENTSUB_HOST,
	secret: environment.TWITCH_EVENTSUB_SECRET
});

// Log errors
eventsub.onSubscriptionCreateFailure( (subscription, error) => {
	logger.error('Eventsub subscription create failure', error);
});

eventsub.onSubscriptionDeleteFailure( (subscription, error) => {
	logger.error('Eventsub subscription delete failure', error);
});

export async function cleanEventsub() {
	logger.info('Clearing broken eventsub subscriptions');
	await api.eventSub.deleteBrokenSubscriptions();
	logger.info('Cleared broken eventsub subscriptions');
}

export function registerTwitchAutoStop(twitchId: string) {
	eventsub.onStreamOffline(twitchId, async () => {
		User.findOneBy({ twitchId }).then(u => {
			if(u && (u.config.twitchAutoStop??true)) {
				// Trigger stop recording only if user still has option activated
				io.to(`twitch-${twitchId}`).emit('action', { type: 'stop' });
			}
		})
		.catch(e => {
			logger.error(`Twitch autostop error getting user ${twitchId}`, e);
		});
	});
}
