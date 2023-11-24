import { Router } from "express";

type Contributor = {
	discordId: string
	role: string
	name: string
	img: string
}

const contributors: Contributor[] = [
	{
		discordId: "207935292995403777",
		role: "Original idea and testing",
		name: "aypierre",
		img: "https://cdn.discordapp.com/avatars/207935292995403777/c0a365f3ce2109b5f5b327b4ef182249?size=1024"
	},
	{
		discordId: "410774625820082176",
		role: "Front-end developer (site & extension)",
		name: "Sytorex",
		img: "https://cdn.discordapp.com/avatars/410774625820082176/8ea18d13ad66500c7348959e11287a7f?size=1024"
	},
	{
		discordId: "522390113536311328",
		role: "Front-end developer & design (site)",
		name: "Rem_x",
		img: "https://cdn.discordapp.com/avatars/522390113536311328/372618edece44c88de0027e909a1e12f?size=1024"
	},
	{
		discordId: "184375239843643394",
		role: "Back-end developer (site)",
		name: "Kranack",
		img: "https://cdn.discordapp.com/avatars/184375239843643394/861902e16660b0b0203142295ee74ef3?size=1024"
	},
	{
		discordId: "325353577281355798",
		role: "Designer (site & extension)",
		name: "Coco",
		img: "https://cdn.discordapp.com/avatars/325353577281355798/f833307ad0e2762e5b4a4f1a312074c0?size=1024"
	},
	{
		discordId: "110151716124520448",
		role: "Voice recording developer",
		name: "Theondrus",
		img: "https://cdn.discordapp.com/avatars/110151716124520448/427fafd2ee319fb2e6f732885ba50586?size=1024"
	},
	{
		discordId: "179672144131653642",
		role: "Back-end developer",
		name: "Salutations Distinguées",
		img: "https://cdn.discordapp.com/avatars/179672144131653642/60baa9d4203c556e81a9d64ae5bc471b?size=1024"
	},
	{
		discordId: "342750918556778498",
		role: "Designer (extension)",
		name: "Velie",
		img: "https://cdn.discordapp.com/avatars/342750918556778498/eec29a0e6ffe86ade3f0a5ffe53c4315?size=1024"
	},
];

const others = ["Agape", "Maner", "Ouafax", "RacoonSama", "Random9", "Sirop_D_Or", "Xem"];

// Update contributor list on app start
(async ()=>{
	try {
		for(const c of contributors) {
			const res = await fetch('https://discord.com/api/v10/users/'+c.discordId, {
				headers: {
					'Authorization': 'Bot ' + process.env.DISCORD_BOT_TOKEN,
					'Content-Type': 'application/json',
				}
			});
			if(!res.ok) {
				throw new Error('Discord API error: '+res.status+ ' '+res.statusText);
			}
			const data = await res.json();
			if(data.avatar) {
				c.img = 'https://cdn.discordapp.com/avatars/'+c.discordId+'/'+data.avatar+'?size=1024';
			}
			if(data.global_name) {
				c.name = data.global_name;
			}
		}

		// Sort contributors by name
		contributors.sort((a, b) => {
			if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
			if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
			return 0;
		});

	}catch(e) {
		console.error('Error fetching contributors infos', e);
	}
})();

export const thanksRouter = Router();

thanksRouter.get('', async (req, res, next)=>{
	res.json({contributors, others});
});