import Keycloak from 'keycloak-js';

let keycloakInstance: Keycloak | null = null;

export function initializeKeycloak(): Promise<boolean> {
  keycloakInstance = new Keycloak({
    url: 'http://localhost:8082',
    realm: 'diet-realm',
    clientId: 'angular-frontend'
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
