import { exchangeCode } from "@twurple/auth";
import { api, authProvider, clientId, clientSecret, redirectUri } from "./twitch";


export async function auth(code: string) {
	const token = await exchangeCode(clientId, clientSecret, code, redirectUri);
	const userId = await authProvider.addUserForToken(token);
	const user = await api.users.getAuthenticatedUser(userId);
	return {
		userId,
		name: user.name,
		displayName: user.displayName,
		email: user.email,
		img: user.profilePictureUrl,
		token,
	};
}