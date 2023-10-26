
FROM node:18-alpine3.18 as build

WORKDIR /app

#copy config
COPY *.json vite.config.ts svelte.config.js ./
RUN npm ci

#copy src files
COPY src ./src/
COPY static ./static/

RUN npm run build

FROM nginx:1.23-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html
