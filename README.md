# UltimateClosedCaptions

Closed captions extension for Twitch

Speech to text using Web Speech API

Translation possible with multiple services using your own API keys
- Google Translation API (Probably best results)
- Later: Microsoft Azure Translator (Cheaper than google)

## Roadmap

- Configurable delay to send non-final versions of captions
- Dashboard controls via streamdeck
- Website:
  - Dashboard redesign ?
  - Support changing translation services
  - Support other speech to text services (interesting ? often expensive)
  - Send captions to OBS (with obs-websocket)
- Streamer tutorial / info page
- Check if extension is installed
- Setting to stop recording voice when stream ends
- Setup translation server working without further configuration (free ? limited ? paid ? with bits?)
- Allow streamer to choose if captions are shown to viewers by default or not
- Customisable captions delay (may be necessary if streaming with additional delay..?)
- Banned words (before/after translation?)
- Detect used translation to enable only necessary ones


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
- Start : `docker compose -f docker-compose.yml -f docker-compose-dev.yml up --build --attach back`
- This will start the backend in dev mode, with a static version of the website
- Address: http://localhost:8000
- nodemon will restart server after any modifications in backend code
- for local backend dev, run `pnpm install` in back folder to get types working

#### Website / extension
- `cd website` / `cd sveltxtension`
- Install: `pnpm install`
- Start local dev server: `pnpm dev`
