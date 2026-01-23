import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

let keycloakInstance: Keycloak | null = null;

export function initializeKeycloak(): Promise<boolean> {
  return new Promise((resolve) => {
    if (keycloakInstance?.authenticated) {
      resolve(true);
      return;
    }

    keycloakInstance = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId
    });

    keycloakInstance
      .init({
        onLoad: 'check-sso',
        checkLoginIframe: false
      })
      .then((authenticated) => {
        console.log('✅ Keycloak initialized:', authenticated);
        resolve(true);
      })
      .catch((error) => {
        console.error('❌ Keycloak init error:', error);
        resolve(true);
      });
  });
}

export function getKeycloak(): Keycloak | null {
  return keycloakInstance;
}

export function isKeycloakAuthenticated(): boolean {
  return keycloakInstance?.authenticated ?? false;
}
