# --- Build de la PWA ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Servidor ligero Node.js para servir PWA y conectar con backend ---
FROM node:22-alpine
WORKDIR /app
COPY server.mjs ./
COPY --from=build /app/dist ./dist

EXPOSE 19821
CMD ["node", "server.mjs"]
