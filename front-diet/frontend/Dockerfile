# syntax=docker/dockerfile:1

# ---------- BUILD Angular ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY front-diet/frontend/package*.json ./
RUN npm install

COPY front-diet/frontend/ ./

RUN npm run build

# ---------- RUNTIME Nginx ----------
FROM nginx:alpine

# ✅ Supprime la config par défaut
RUN rm -f /etc/nginx/conf.d/default.conf

# ✅ Crée une config CORRECTE
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # Static files with long cache
    location ~* ^/assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # JS/CSS files with 30 day cache
    location ~* \.(js|css|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
    }

    # Angular SPA - always serve index.html for routes
    location / {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        try_files $uri $uri/ /index.html;
    }

    # Block hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# ✅ Copie le build - VÉRIFIE LE CHEMIN
COPY --from=build /app/dist/app-diet/browser /usr/share/nginx/html

# ✅ Permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html/* && \
    ls -la /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



# syntax=docker/dockerfile:1

# # ---------- BUILD Angular ----------
# FROM node:20-alpine AS build
# WORKDIR /app

# COPY front-diet/frontend/package*.json ./
# RUN npm install
# COPY front-diet/frontend/ ./
# RUN npm run build --configuration=production

# # ---------- RUNTIME Nginx ----------
# FROM nginx:alpine

# RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
#     echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
#     echo '    server_name _;' >> /etc/nginx/conf.d/default.conf && \
#     echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
#     echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
#     echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
#     echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
#     echo '    }' >> /etc/nginx/conf.d/default.conf && \
#     echo '    error_page 404 /index.html;' >> /etc/nginx/conf.d/default.conf && \
#     echo '    error_page 500 502 503 504 /index.html;' >> /etc/nginx/conf.d/default.conf && \
#     echo '    location = /index.html { internal; }' >> /etc/nginx/conf.d/default.conf && \
#     echo '    location /assets/ {' >> /etc/nginx/conf.d/default.conf && \
#     echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf && \
#     echo '        add_header Cache-Control "public";' >> /etc/nginx/conf.d/default.conf && \
#     echo '    }' >> /etc/nginx/conf.d/default.conf && \
#     echo '}' >> /etc/nginx/conf.d/default.conf

# COPY --from=build /app/dist/app-diet/browser /usr/share/nginx/html

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
