# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app
# ✅ Use full paths from repo root
COPY ./front-diet/frontend/package*.json ./
RUN npm install
COPY ./front-diet/frontend/ .
RUN npm run build --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY ./front-diet/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
