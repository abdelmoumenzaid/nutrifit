FROM node:20-alpine
WORKDIR /app

# Copier package.json pour test
COPY package*.json ./

# Lister les fichiers pour debug
RUN echo "===== CONTENU DU DOSSIER /app =====" && ls -la

# Installer dépendances
RUN npm install

# Copier le reste du projet
COPY . .

# Lister le contenu après copie
RUN echo "===== CONTENU APRES COPY =====" && ls -la
