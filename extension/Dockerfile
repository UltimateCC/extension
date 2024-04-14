FROM node:18-alpine3.18 as base

WORKDIR /app

RUN corepack enable

#copy config
COPY *.json vite.config.ts svelte.config.js pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

#copy src files
COPY index.html ./
COPY src ./src/

CMD [ "pnpm", "dev" ]
