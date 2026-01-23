# ---------- BUILD Angular ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copier package.json + package-lock.json du frontend
COPY frontend/package*.json ./

# Installer dépendances
RUN npm install

# Copier tout le frontend
COPY frontend/ ./

# Build Angular
RUN npm run build --configuration=production

# ---------- RUNTIME Express ----------
FROM node:20-alpine
WORKDIR /app

# Copier server + build + package.json runtime
COPY frontend/package*.json ./
COPY frontend/server.js ./
COPY --from=build /app/dist/app-diet/browser ./dist/app-diet/browser

# Installer dépendances runtime
RUN npm install --production

EXPOSE 8080
CMD ["node", "server.js"]
