
FROM node:18-alpine3.18 as base

RUN apk add --no-cache ffmpeg

WORKDIR /app

RUN corepack enable

#copy config
COPY *.json pnpm-lock.yaml ./

RUN pnpm i --frozen-lockfile

#copy src files
COPY src /app/src

FROM base as production

RUN pnpm build

CMD [ "yarn", "start" ]

