// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://backend-production-44d4.up.railway.app/api',
  keycloak: {
    url: 'https://nutrifit-production-c4b6.up.railway.app',
    realm: 'nutrifit',                      // ← Change de master à nutrifit
    clientId: 'diet-frontend'               // ← Change de angular-frontend
  }
};
