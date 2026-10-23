FROM node:26-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN npm install -g corepack@latest
RUN corepack enable

#copy config
COPY *.json vite.config.ts svelte.config.js pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile

#copy src files
COPY index.html ./
COPY src ./src/

CMD [ "pnpm", "dev", "--host" ]
