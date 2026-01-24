export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api/public/',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'nutrifit',
    clientId: 'diet-frontend',
  },
  // ✅ AJOUTE CES LIGNES:
  frontendUrl: 'http://localhost:4200',
  callbackUrl: 'http://localhost:4200/callback',
};
