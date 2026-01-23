import Keycloak from 'keycloak-js';

let keycloakInstance: Keycloak | null = null;

export function initializeKeycloak(): Promise<boolean> {
  keycloakInstance = new Keycloak({
  url: 'https://nutrifit-production-c4b6.up.railway.app',
  realm: 'nutrifit',
  clientId: 'diet-frontend'
});


  return keycloakInstance
    .init({
      onLoad: 'check-sso',
      checkLoginIframe: false
    })
    .then((authenticated) => {
      console.log('✅ Keycloak initialized:', authenticated);
      return true;
    })
    .catch((error) => {
      console.error('❌ Keycloak init error:', error);
      return true;
    });
}

export function getKeycloak(): Keycloak {
  if (!keycloakInstance) {
    throw new Error('Keycloak not initialized');
  }
  return keycloakInstance;
}
