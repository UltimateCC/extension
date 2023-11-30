
import { RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { User } from "../entity/User";
import { dataSource } from "../database";
import { config } from "../config";
import { logger } from "../logger";


export const clientId = config.TWITCH_CLIENTID;
export const ownerId = config.TWITCH_OWNERID;
export const secret = config.TWITCH_SECRET;
export const clientSecret = config.TWITCH_CLIENTSECRET;
export const redirectUri = config.TWITCH_REDIRECT_URI;

export const authURL = 'https://id.twitch.tv/oauth2/authorize?' + new URLSearchParams({
	response_type: 'code',
	client_id: clientId,
	redirect_uri: redirectUri,
	scope: 'user:read:broadcast user:read:email'
});


export const authProvider = new RefreshingAuthProvider({clientId, clientSecret});
authProvider.onRefresh((user, token)=>{
	dataSource.manager.update(User, {
		twitchId: user
	},{
		twitchToken: token
	});
});
authProvider.onRefreshFailure((user)=>{
	logger.error('Twitch token refresh failure for user '+user);
});

/* Ensure user tokens are loaded from database */
export async function ensureUserReady(user: string) {
	if(!authProvider.hasUser(user)) {
		const u = await User.findOneByOrFail({ twitchId: user });
		authProvider.addUser(user, u.twitchToken);
	}
}

export const api = new ApiClient({authProvider});

