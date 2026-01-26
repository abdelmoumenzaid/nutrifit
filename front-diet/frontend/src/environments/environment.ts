// export const environment = {
//   production: false,
//   apiUrl: 'https://backend-production-44d4.up.railway.app/api/public/',  // ← Railway au lieu de localhost
//   keycloak: {
//     url: 'http://localhost:8080',
//     realm: 'nutrifit',
//     clientId: 'diet-frontend',
//   },
//   // ✅ AJOUTE CES LIGNES:
//   frontendUrl: 'http://localhost:4200',
//   callbackUrl: 'http://localhost:4200/callback',
// };
export const environment = {
  production: false,

  // 👉 En dev, on parle au backend local, pas à Railway
  apiUrl: 'http://localhost:8080/api/public/',

  keycloak: {
    // 👉 Ici tu mets l’URL réelle de ton serveur Keycloak local
    url: 'http://localhost:8082',
    realm: 'nutrifit',
    clientId: 'diet-frontend',
  },

  frontendUrl: 'http://localhost:4200',
  callbackUrl: 'http://localhost:4200/callback',
};
