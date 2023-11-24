# UltimateClosedCaptions

Closed captions extension for Twitch

Speech to text using Web Speech API (free)

Translation possible using Google Translation API and your own API keys

## Roadmap
All features in this roadmap are in no particular order,
join the discord and tell us if you are particularly interested in one of them, or want to suggest another one

- Support other translation services:
  - Azure (cheaper)
  - LibreTranslate (self hosted)

- Configurable delay between non-final captions
  - Allows streamers to choose between smoother captions for their viewers, or lower prices for translation

- Support other speech to text services
  - Would allow automatic language detection
  - Are streamers willing to pay 1$/h for this feature anyway ?

- Send captions to OBS
  - Send captions to OBS using obs-websocket
  - Would allow captions on Twitch VODs, but only in one language

- Warn user if extension is not installed
  - Dashboard warning when extension is not installed

- Setting to stop recording voice when stream ends
  - Stop listening for speech at end of stream to avoid captions running when unnecessary

- Setup translation server working without further configuration 
  - Free translations but for a really limited time ?
  - Paid by streamer ?
  - Paid by viewers with bits ?

- Allow streamer to choose if captions are shown to viewers by default or not
  - Should be possible with next extension release

- Customisable captions delay
  - Would allow broadcaster to add delay to captions to match a delayed stream

- Banned words
  - Before and after translation ?

- Detect used translations to enable only necessary ones
  - Would probably require large server capacity to handle viewer requests
  - Is it worth ?

- Export generated subtitles
  - Export subtitles to an SRT files to allow later use

- Show subtitles in popup window
  - Show subtitles in a separate window to integrate directly into streams without using extension

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
