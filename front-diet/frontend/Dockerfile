# ---------- BUILD Angular ----------
FROM node:20-alpine AS build
WORKDIR /app

# 1) Copier les package.json du FRONT depuis la racine du repo (app-diet)
COPY front-diet/frontend/package*.json ./

# 2) Installer les dépendances
RUN npm install

# 3) Copier TOUT le code frontend (Angular)
COPY front-diet/frontend/ ./

# 4) Build Angular en production
RUN npm run build --configuration=production

# ---------- RUNTIME Nginx ----------
FROM nginx:alpine

# 5) Copier la config NGINX du FRONT
COPY front-diet/frontend/config/nginx.conf /etc/nginx/conf.d/default.conf

# 6) Copier les fichiers Angular compilés vers le dossier servi par NGINX
COPY --from=build /app/dist/app-diet/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
