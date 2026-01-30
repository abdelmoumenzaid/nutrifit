export const environment = {
  production: true,
  apiUrl: 'https://backend-production-44d4.up.railway.app/api/public/',
  // ✅ Agent IA production
  agentUrl: 'https://agent-ia-production-7fb0.up.railway.app/api',
  keycloak: {
    url: 'https://nutrifit-production-c4b6.up.railway.app',
    realm: 'nutrifit',
    clientId: 'diet-frontend',
  },
  // ✅ AJOUTE CES LIGNES:
  frontendUrl: 'https://front-end-production-0ec7.up.railway.app',
  callbackUrl: 'https://front-end-production-0ec7.up.railway.app/callback',
};
