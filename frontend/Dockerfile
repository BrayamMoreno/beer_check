# --- Build de la PWA ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Servidor ligero Node.js para servir la SPA/PWA ---
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 19821
CMD ["serve", "-s", "dist", "-l", "19821"]
