export const environment = {
  production: false,

  // 👉 Backend Spring local
  apiUrl: 'http://localhost:8080/api/public/',

  // 👉 Agent IA local (pour dev)
  agentUrl: 'http://localhost:8000/api',

  // 👉 Ton SEUL Keycloak (celui déployé sur Railway)
  keycloak: {
    url: 'https://nutrifit-production-c4b6.up.railway.app',
    realm: 'nutrifit',
    clientId: 'diet-frontend',   // le client front défini dans ce realm
  },

  frontendUrl: 'http://localhost:4200',
  callbackUrl: 'http://localhost:4200/callback',
};
