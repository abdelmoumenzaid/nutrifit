export const environment = {
  production: false,
  apiUrl: 'https://backend-production-44d4.up.railway.app/api/public/',  // ← Railway au lieu de localhost
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'nutrifit',
    clientId: 'diet-frontend',
  },
  // ✅ AJOUTE CES LIGNES:
  frontendUrl: 'http://localhost:4200',
  callbackUrl: 'http://localhost:4200/callback',
};
