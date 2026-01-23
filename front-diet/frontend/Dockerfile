# ---------- BUILD ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copier uniquement package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Debug : lister les fichiers après COPY package.json
RUN echo "===== CONTENU APRÈS COPY package.json =====" && ls -la

# Installer les dépendances
RUN echo "===== INSTALLATION DES DEPENDANCES =====" \
    && npm install \
    && echo "===== DEPENDANCES INSTALLÉES ====="

# Copier le reste du projet
COPY . .

# Debug : lister le contenu complet après copie
RUN echo "===== CONTENU APRÈS COPY TOUT =====" && ls -la && ls -R

# Build Angular
RUN echo "===== BUILD ANGULAR =====" \
    && npm run build --configuration=production \
    && echo "===== BUILD TERMINÉ ====="

# ---------- SERVEUR EXPRESS ----------
FROM node:20-alpine
WORKDIR /app

# Copier uniquement le build + server.js + package.json pour runtime
COPY package*.json ./
COPY server.js ./
COPY --from=build /app/dist/app-diet/browser ./dist/app-diet/browser

# Debug : lister le contenu runtime
RUN echo "===== CONTENU RUNTIME =====" && ls -la && ls -R

# Installer les dépendances runtime
RUN echo "===== INSTALLATION DEPENDANCES RUNTIME =====" \
    && npm install --production \
    && echo "===== DEPENDANCES RUNTIME INSTALLÉES ====="

# Exposer le port (Railway utilisera process.env.PORT)
EXPOSE 8080

# Debug : message avant démarrage
CMD echo "===== DEMARRAGE DU SERVEUR EXPRESS =====" && node server.js
