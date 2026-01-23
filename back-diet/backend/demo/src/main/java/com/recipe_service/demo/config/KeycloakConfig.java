package com.recipe_service.demo.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * ✅ PRODUCTION-READY Keycloak Configuration
 * 
 * Realm: nutrifit
 * Client: spring-admin
 * Auth Flow: Client Credentials (Service Account)
 * 
 * Variables d'environnement requises:
 * - KEYCLOAK_SERVER_URL=https://nutrifit-production-c4b6.up.railway.app
 * - KEYCLOAK_REALM=nutrifit
 * - KEYCLOAK_ADMIN_CLIENT_ID=spring-admin
 * - KEYCLOAK_ADMIN_CLIENT_SECRET=<secret>
 */
@Configuration
@Profile("prod")
public class KeycloakConfig {

    @Value("${KEYCLOAK_SERVER_URL:${keycloak.server-url:http://localhost:8082}}")
    private String keycloakServerUrl;

    @Value("${KEYCLOAK_REALM:${keycloak.realm:nutrifit}}")
    private String keycloakRealm;

    @Value("${KEYCLOAK_ADMIN_CLIENT_ID:${keycloak.admin-client-id:spring-admin}}")
    private String adminClientId;

    @Value("${KEYCLOAK_ADMIN_CLIENT_SECRET:${keycloak.admin-client-secret:}}")
    private String adminClientSecret;

    /**
     * ✅ Bean Keycloak Admin Client
     * Service Account Flow - Authentification par Client Secret
     */
    @Bean
    public Keycloak keycloak() {
        System.out.println("\n🔑 ============================================");
        System.out.println("🔑 Initializing Keycloak Admin Client");
        System.out.println("   Environment: PRODUCTION");
        System.out.println("   Server: " + keycloakServerUrl);
        System.out.println("   Realm: " + keycloakRealm);
        System.out.println("   Client: " + adminClientId);
        System.out.println("   Auth Method: Client Credentials (Service Account)");
        System.out.println("🔑 ============================================\n");

        try {
            // ✅ Service Account Flow - Plus sécurisé et recommandé
            Keycloak keycloakClient = KeycloakBuilder.builder()
                .serverUrl(keycloakServerUrl)
                .realm(keycloakRealm)
                .clientId(adminClientId)
                .clientSecret(adminClientSecret)
                .grantType("client_credentials")
                .build();

            System.out.println("✅ ============================================");
            System.out.println("✅ Keycloak Admin Client initialized successfully!");
            System.out.println("✅ Auth: Client Credentials (Service Account)");
            System.out.println("✅ Ready to manage realm: " + keycloakRealm);
            System.out.println("✅ ============================================\n");

            return keycloakClient;

        } catch (Exception e) {
            System.err.println("\n❌ ============================================");
            System.err.println("❌ Failed to initialize Keycloak Admin Client!");
            System.err.println("❌ Error: " + e.getMessage());
            System.err.println("❌");
            System.err.println("❌ Troubleshooting:");
            System.err.println("❌ 1. Check KEYCLOAK_SERVER_URL is correct");
            System.err.println("❌ 2. Verify client 'spring-admin' exists in realm '" + keycloakRealm + "'");
            System.err.println("❌ 3. Verify KEYCLOAK_ADMIN_CLIENT_SECRET is set correctly");
            System.err.println("❌ 4. Check client has 'manage-users' and 'view-users' roles");
            System.err.println("❌ ============================================\n");
            e.printStackTrace();
            return null;
        }
    }
}