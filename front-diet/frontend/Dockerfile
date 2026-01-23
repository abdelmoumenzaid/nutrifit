# Build Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

# Serve with Nginx
FROM nginx:alpine

# Supprime la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copie la bonne config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ CHEMIN IMPORTANT
COPY --from=build /app/dist/app-diet/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
