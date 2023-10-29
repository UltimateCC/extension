
FROM node:18-alpine3.18 as build

WORKDIR /app

RUN corepack enable

#copy config
COPY *.json vite.config.ts pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

#copy src files
COPY index.html ./
COPY src ./src/
COPY public ./public/

RUN pnpm build

FROM nginx:1.23-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
