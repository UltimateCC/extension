
import { exchangeCode, RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { User } from "./entity/User";
import { dataSource } from "./database";
import { sendExtensionPubSubBroadcastMessage, setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { config } from "./config";


export const clientId = config.TWITCH_CLIENTID;
const ownerId = config.TWITCH_OWNERID;
const secret = config.TWITCH_SECRET;
const clientSecret = config.TWITCH_CLIENTSECRET;
const redirectUri = config.TWITCH_REDIRECT_URI;

export const authURL = 'https://id.twitch.tv/oauth2/authorize?' + new URLSearchParams({
	response_type: 'code',
	client_id: clientId,
	redirect_uri: redirectUri,
	scope: 'user:read:broadcast user:read:email'
});


const authProvider = new RefreshingAuthProvider({clientId, clientSecret});
authProvider.onRefresh((user, token)=>{
	dataSource.manager.update(User, {
		twitchId: user
	},{
		twitchToken: token
	});
});
authProvider.onRefreshFailure((user)=>{
	console.error('Twitch token refresh failure for user '+user);
});

const api = new ApiClient({authProvider});

export async function auth(code: string) {
	const token = await exchangeCode(clientId, clientSecret, code, redirectUri);
	const userId = await authProvider.addUserForToken(token);
	const user = await api.users.getAuthenticatedUser(userId);
	return {
		userId,
		login: user.displayName,
		email: user.email,
		img: user.profilePictureUrl,
		token,
	};
}

export async function isExtensionInstalled(user: string) {
	// https://dev.twitch.tv/docs/api/reference/#get-user-active-extensions
	// Dev version should be included, but they are not :/ bug ?

	if(process.env.NODE_ENV !== 'production') {
		return true;
	}

	try{
		if(!authProvider.hasUser(user)) {
			const u = await User.findOneByOrFail({ twitchId: user });
			authProvider.addUser(user, u.twitchToken);
		}
		const exts = await api.users.getActiveExtensions(user, true);
		for(const ext of exts.getAllExtensions()) {
			if(ext.id === clientId) {
				return true;
			} 
		}
	}catch(e) {
		console.error('Error checking if extension is installed', e);
		// In case of error return true to not disturb user
		return true;
	}
	return false;
}

export async function sendPubsub(userId: string, message: string) {
	await sendExtensionPubSubBroadcastMessage({ clientId, secret, ownerId }, userId, message);
}

export async function saveTwitchConfig(userId: string, config: string) {
	await setExtensionBroadcasterConfiguration({ clientId, secret, ownerId }, userId, config);
}

// Get live channels currently live with the extension
export async function getLiveChannels() {
	const channels = await api.extensions.getLiveChannelsWithExtensionPaginated(clientId).getAll();
	return channels.map(c=>(
		{
			id: c.id,
			displayName: c.displayName,
			title: c.title,
			gameName: c.gameName
		}
	));
}