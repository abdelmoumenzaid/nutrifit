package com.recipe_service.demo.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    @Value("${keycloak.server-url:http://localhost:8082}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm:diet-realm}")
    private String keycloakRealm;

    @Value("${keycloak.admin-username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin-password:admin}")
    private String adminPassword;

    @Value("${keycloak.admin-client-id:admin-cli}")
    private String adminClientId;

    /**
     * ✅ Bean Keycloak Admin Client
     * 🔑 IMPORTANT: Use "master" realm for admin authentication
     */
    @Bean
    public Keycloak keycloak() {
        System.out.println("\n🔑 ============================================");
        System.out.println("🔑 Initializing Keycloak Admin Client...");
        System.out.println("   Server: " + keycloakServerUrl);
        System.out.println("   Admin Realm: master");
        System.out.println("   Target Realm: " + keycloakRealm);
        System.out.println("🔑 ============================================\n");

        try {
            // ⚠️ CRITICAL: realm("master") for admin credentials authentication
            Keycloak keycloakClient = KeycloakBuilder.builder()
                    .serverUrl(keycloakServerUrl)
                    .realm("master")  // ← Must be "master" for admin auth!
                    .username(adminUsername)
                    .password(adminPassword)
                    .clientId(adminClientId)
                    .build();

            System.out.println("\n✅ ============================================");
            System.out.println("✅ Keycloak Admin Client initialized successfully!");
            System.out.println("✅ Ready to manage realm: " + keycloakRealm);
            System.out.println("✅ ============================================\n");
            
            return keycloakClient;

        } catch (Exception e) {
            System.err.println("\n❌ ============================================");
            System.err.println("❌ Failed to initialize Keycloak!");
            System.err.println("❌ Error: " + e.getMessage());
            System.err.println("❌ ============================================\n");
            e.printStackTrace();
            return null;
        }
    }
}
