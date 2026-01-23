# syntax=docker/dockerfile:1

# ---------- BUILD Angular ----------
FROM node:20-alpine AS build
WORKDIR /app

# Affiche le contenu du contexte pour déboguer
RUN ls -la /

COPY package*.json ./

# Affiche si les fichiers ont été copiés
RUN ls -la /app/

RUN npm install
COPY . .
RUN npm run build --configuration=production

# ---------- RUNTIME Nginx ----------
FROM nginx:alpine

# Affiche le contenu de la racine nginx
RUN ls -la /

# Générer la config nginx
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name _;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    error_page 404 /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    error_page 500 502 503 504 /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location = /index.html { internal; }' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /assets/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Cache-Control "public";' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Vérifie que le config a été créée
RUN ls -la /etc/nginx/conf.d/

COPY --from=build /app/dist/app-diet/browser /usr/share/nginx/html

# Vérifie les fichiers copiés
RUN ls -la /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
