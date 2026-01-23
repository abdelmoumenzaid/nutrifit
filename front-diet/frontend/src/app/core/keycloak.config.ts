import { environment } from '../../environments/environment';

/**
 * 🔐 Configuration Keycloak pour Angular Standalone
 * À utiliser dans app.config.ts
 */
export const keycloakConfig = {
  url: environment.keycloak.url,
  realm: environment.keycloak.realm,
  clientId: environment.keycloak.clientId,
};

/**
 * ✅ Initialisation Keycloak au démarrage
 * Peut être appelée depuis main.ts ou app.config.ts
 */
export function initKeycloak(): Promise<boolean> {
  const Keycloak = require('keycloak-js');

  const keycloak = new Keycloak({
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId,
  });

  return keycloak
    .init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      checkLoginIframe: false,
      redirectUri: `${window.location.origin}/`,  // ← AJOUTE ÇA
    })
    .then((authenticated: boolean) => {
      console.log('✅ Keycloak initialized:', authenticated);
      return true;
    })
    .catch((error: any) => {
      console.error('❌ Keycloak init error:', error);
      return true;
    });
}

