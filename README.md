# UltimateClosedCaptions

Closed captions extension for Twitch.

Speech to text for free based on Web Speech API.

Optional translation using Google Translation API and your own API keys.

Join our discord: https://discord.gg/f8fUqHwtHx

## Development

#### Twitch config
- Go to https://dev.twitch.tv/console/ and create an extension
- Config asset hosting:
  - Base test uri: https://localhost:5174/
  - Configure all pages to `index.html`
- Whitelist accounts for testing
- Activate the extension on your channel

#### Back
- Copy exemple.env to .env and fill env variables
- Create a docker volume for database persistence: `docker volume create captionsdb`
- Start : `./dev.sh`
- This will start the backend in dev mode, with a static version of the website
- Address: http://localhost:8000
- nodemon will restart server after any modifications in backend code
- for local backend dev, run `pnpm install` in back folder to get types working

#### Website / extension
- `cd website` / `cd extension`
- Install: `pnpm install`
- Start local dev server: `pnpm dev`
