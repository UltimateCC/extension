# UltimateClosedCaptions

Closed captions extension for Twitch

Speech to text using Web Speech API

Translation possible with multiple services using your own API keys
- Google Translation API (Probably best results)
- Microsoft Azure Translator (Cheaper than google)

Roadmap maybe later:
- Automatically check if extension is installed
- Send captions to OBS (with obs-websocket)
- Send non-final versions of captions (will help with longer sentences)
- Setup translation server working without further configuration (free ? limited ? paid ?)
- Additional settings
  - Stop captions at the end of the stream
  - Allow streamer to choose if captions are shown to viewers by default or not
  - Add custom delay to captions (may be necessary if streaming with delay..?)
  - Banned words

## Development

#### Twitch config
(Instructions not updated)
- Go to https://dev.twitch.tv/console/ and create an extension
- Config asset hosting:
  - Base test uri: https://localhost:5174/
  - Configure all pages to `index.html`
- Whitelist accounts for testing
- Activate the extension on your channel

#### Back
- Copy exemple.env to .env and fill env variables
- Start : `docker compose -f docker-compose.yml -f docker-compose-dev.yml up --build --attach back`
- This will start the backend in dev mode, with a static version of the website
- Address: http://localhost:8000
- nodemon will restart server after any modifications in backend code
- for local backend dev, run `npm install` in back folder to get types working

#### Website
- `cd website`
- Install: `yarn`
- Start local dev server: `yarn dev`
