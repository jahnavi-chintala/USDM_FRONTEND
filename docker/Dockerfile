# ---- Build: compile the static site ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Serve: nginx with the built files --------------------------------------------------------
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
# Scripts in /docker-entrypoint.d run before nginx starts; this one writes /config.js.
COPY --chmod=0755 docker/40-write-app-config.sh /docker-entrypoint.d/40-write-app-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

# Backend URL as seen from the user's browser. Override with `docker run -e ...`.
ENV API_URL=""

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
