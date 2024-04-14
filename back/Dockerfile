FROM node:18-alpine3.18 as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

#copy config
COPY *.json pnpm-lock.yaml ./

FROM base as deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --frozen-lockfile

FROM deps as build
COPY src /app/src
RUN pnpm build

FROM base as prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm i --prod --frozen-lockfile

# Include only necessary files in final image
FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build

CMD [ "pnpm", "start" ]
