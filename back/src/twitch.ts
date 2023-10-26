
import { exchangeCode, getTokenInfo, RefreshingAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";
import { User } from "./entity/User";
import { dataSource } from "./database";
import { sendExtensionPubSubBroadcastMessage } from "@twurple/ebs-helper";


const ownerId = process.env.TWITCH_OWNERID!;
const secret = process.env.TWITCH_SECRET!;
export const clientId = process.env.TWITCH_CLIENTID!;
const clientSecret = process.env.TWITCH_CLIENTSECRET!;
const redirectUri = process.env.TWITCH_REDIRECT_URI!;

export const authURL = 'https://id.twitch.tv/oauth2/authorize?response_type=code'
	+'&client_id='+ clientId
	+'&redirect_uri='+ process.env.TWITCH_REDIRECT_URI
	+'&scope=user:read:broadcast';


export async function auth(code: string) {
	const token = await exchangeCode(clientId, clientSecret, code, redirectUri);
	const info = await getTokenInfo(token.accessToken);
	return { userid: info.userId!, login: info.userName!, token };
}

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

export async function isExtensionInstalled(user: string) {
	return true;

	// https://dev.twitch.tv/docs/api/reference/#get-user-active-extensions
	// Get User Active Extensions seems broken with extension in dev even with authorization
	// Todo after extension is released:
	// Try something like this

	/*
	try{
		if(!authProvider.hasUser(user)) {
			const u = await dataSource.manager.findOneByOrFail(User, { twitchId: user });
			authProvider.addUser(user, u.twitchToken);
		}
		const exts = await api.users.getActiveExtensions(user, true);
		for(const ext of exts.getAllExtensions()) {
			if(ext.id === clientId) {
				return true;
			} 
		}
	}catch(e) {}
	return false;
	*/
}

export async function sendPubsub(userId: string, message: string) {

	try {
		await sendExtensionPubSubBroadcastMessage({ clientId, secret, ownerId }, userId, message)
	}catch(e) {
		console.error('Error sending pubsub message', e);
	}

}