import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

let keycloakInstance: Keycloak | null = null;

export function initializeKeycloak(): Promise<boolean> {
  keycloakInstance = new Keycloak({
    url: environment.keycloak.url,           // ✅ Utilise l'environment
    realm: environment.keycloak.realm,       // ✅ Utilise l'environment
    clientId: environment.keycloak.clientId  // ✅ Utilise l'environment
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
      return true; // Continue même si Keycloak échoue
    });
}

export function getKeycloak(): Keycloak {
  if (!keycloakInstance) {
    throw new Error('Keycloak not initialized');
  }
  return keycloakInstance;
}
