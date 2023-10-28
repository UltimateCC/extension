
FROM node:18-alpine3.18 as base

RUN apk add --no-cache ffmpeg

WORKDIR /app

#copy config
COPY *.json yarn.lock ./

RUN yarn install --frozen-lockfile

#copy src files
COPY src /app/src

FROM base as production

RUN yarn build

CMD [ "yarn", "start" ]

