# Base Node
FROM node:20-alpine
WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier tout le projet
COPY . .

# Build Angular
RUN npm run build --configuration=production

# Exposer le port
EXPOSE 8080

# Lancer Express
CMD ["node", "server.js"]
