import { Router } from "express";
import { environment } from "../config/environment";
import { logger } from "../config/logger";

type Contributor = {
	discordId: string
	role: string
	name: string
	img: string
}

const contributors: Contributor[] = [
	{
		discordId: "179672144131653642",
		role: "Developer",
		name: "Salutations Distinguées",
		img: "https://cdn.discordapp.com/avatars/179672144131653642/60baa9d4203c556e81a9d64ae5bc471b?size=1024"
	},
	{
		discordId: "410774625820082176",
		role: "Developer",
		name: "Sytorex",
		img: "https://cdn.discordapp.com/avatars/410774625820082176/8ea18d13ad66500c7348959e11287a7f?size=1024"
	},
	{
		discordId: "325353577281355798",
		role: "Designer",
		name: "Coco",
		img: "https://cdn.discordapp.com/avatars/325353577281355798/f833307ad0e2762e5b4a4f1a312074c0?size=1024"
	},
];

const others = ["Kranack", "Rem_x", "Theondrus", "Velie"];

// Update contributor list on app start
(async ()=>{
	try {
		if(!environment.DISCORD_BOT_TOKEN) {
			return;
		}
		for(const c of contributors) {
			const res = await fetch(`https://discord.com/api/v10/users/${c.discordId}`, {
				headers: {
					'Authorization': `Bot ${environment.DISCORD_BOT_TOKEN}`,
					'Content-Type': 'application/json',
				}
			});
			if(!res.ok) {
				throw new Error(`Discord API error: ${res.status} ${res.statusText}`);
			}
			const data = await res.json();
			if(data.avatar) {
				c.img = `https://cdn.discordapp.com/avatars/${c.discordId}/${data.avatar}?size=1024`;
			}
			if(data.global_name) {
				c.name = data.global_name;
			}
		}

	}catch(e) {
		logger.error('Error fetching contributors infos', e);
	}
})();

export const thanksRouter = Router();

thanksRouter.get('', async (req, res, next)=>{
	res.json({contributors, others});
});
