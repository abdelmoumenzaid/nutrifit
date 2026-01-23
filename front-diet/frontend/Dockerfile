# ---------- BUILD Angular ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copier package.json + package-lock.json
COPY package*.json ./

# Installer dépendances
RUN npm install

# Copier tout le frontend
COPY . .

# Build Angular
RUN npm run build --configuration=production

# ---------- RUNTIME Nginx ----------
FROM nginx:alpine

# Copier la config nginx
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compilés Angular
COPY --from=build /app/dist/app-diet/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
