# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Build Angular en production
RUN npm run build --configuration=production

# ---------- NGINX ----------
FROM nginx:alpine

# Copier le build Angular (le dossier browser)
COPY --from=build /app/dist/app-diet/browser /usr/share/nginx/html

# Copier la config nginx optimisée
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
