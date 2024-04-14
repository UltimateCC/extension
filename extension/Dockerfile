FROM node:18-alpine3.18 as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

#copy config
COPY *.json vite.config.ts svelte.config.js pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile

#copy src files
COPY index.html ./
COPY src ./src/

CMD [ "pnpm", "dev" ]
