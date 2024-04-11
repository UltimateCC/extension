import { api, authProvider } from "./twitch";


export async function auth(code: string) {
	const userId = await authProvider.addUserForCode(code);
	const user = await api.users.getAuthenticatedUser(userId);
	const token = await authProvider.getAccessTokenForUser(userId);
	return {
		userId,
		name: user.name,
		displayName: user.displayName,
		email: user.email,
		img: user.profilePictureUrl,
		token,
	};
}
