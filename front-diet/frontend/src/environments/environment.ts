// ✅ environment.ts (LOCAL)
export const environment = {
  production: false,

  // 👉 Backend Spring - Racine
  apiUrl: 'http://localhost:8080/api/public',

  // 👉 URL SPÉCIFIQUE pour Chat AI
  aiChatUrl: 'http://localhost:8080/api/public/ai',

  // 👉 URL SPÉCIFIQUE pour Recettes
  recipeUrl: 'http://localhost:8080/api/public/recipe',

  // 👉 Agent IA local (pour dev)
  agentUrl: 'http://localhost:8000/api',

  keycloak: {
    url: 'https://nutrifit-production-c4b6.up.railway.app',
    realm: 'nutrifit',
    clientId: 'diet-frontend',
  },

  frontendUrl: 'http://localhost:4200',
  callbackUrl: 'http://localhost:4200/callback',
};