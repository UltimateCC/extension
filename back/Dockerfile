
FROM node:18-alpine3.18 as base

RUN apk add --no-cache ffmpeg

WORKDIR /app

#copy config
COPY *.json ./

RUN npm ci

#copy src files
COPY src /app/src

FROM base as production

RUN npm run build

CMD [ "npm", "start" ]

