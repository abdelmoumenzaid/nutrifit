package com.recipe_service.demo.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * 🔐 KeycloakConfig - Configuration Complète
 * ✅ JWT Decoder (valide les tokens JWT)
 * ✅ Keycloak Admin Client (gère les utilisateurs)
 * 🔧 FIX: HS256 en premier, puis RS256
 */
@Configuration
public class KeycloakConfig {

    @Value("${KEYCLOAK_SERVER_URL:http://localhost:8082}")
    private String keycloakServerUrl;

    @Value("${KEYCLOAK_REALM:nutrifit}")
    private String keycloakRealm;

    @Value("${KEYCLOAK_ADMIN_CLIENT_ID:spring-admin}")
    private String adminClientId;

    @Value("${KEYCLOAK_ADMIN_CLIENT_SECRET:}")
    private String adminClientSecret;

    @Value("${JWT_SECRET:my-secret-key-for-jwt-token-generation-2024-2025}")
    private String jwtSecret;

    // ============================================
    // 🔑 JWT DECODER - Pour valider les tokens
    // ============================================

    /**
     * 🔑 JWT Decoder Bean
     * 🔧 FIX: Essayer HS256 EN PREMIER (tokens locaux)
     * ✅ Fallback sur RS256 (Keycloak)
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        System.out.println("\n🔐 ============================================");
        System.out.println("🔐 Initializing JWT Decoder");
        System.out.println("   Keycloak Server: " + keycloakServerUrl);
        System.out.println("   Keycloak Realm: " + keycloakRealm);
        System.out.println("🔐 ============================================\n");

        try {
            // 🔧 FIX: Essayer HS256 EN PREMIER (tokens locaux)
            if (jwtSecret != null && !jwtSecret.isEmpty()) {
                System.out.println("📡 Trying HS256 (Local JWT)...");
                
                SecretKeySpec secretKey = new SecretKeySpec(
                    jwtSecret.getBytes(StandardCharsets.UTF_8),
                    0,
                    jwtSecret.getBytes(StandardCharsets.UTF_8).length,
                    "HmacSHA256"
                );

                JwtDecoder localDecoder = NimbusJwtDecoder.withSecretKey(secretKey)
                    .build();

                System.out.println("✅ Using HS256 Decoder (Local JWT)\n");
                return localDecoder;
            }
        } catch (Exception e) {
            System.err.println("⚠️ HS256 setup failed: " + e.getMessage());
        }

        // Fallback sur RS256 (Keycloak)
        try {
            System.out.println("📡 Trying Keycloak RS256...");
            String jwkSetUri = keycloakServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/certs";
            System.out.println("   JWK Set URI: " + jwkSetUri);
            
            JwtDecoder keycloakDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri)
                .build();
            
            System.out.println("✅ Using Keycloak RS256 Decoder\n");
            return keycloakDecoder;

        } catch (Exception e) {
            System.err.println("⚠️ Keycloak RS256 failed: " + e.getMessage());
            throw new RuntimeException("Failed to initialize JWT Decoder", e);
        }
    }

    // ============================================
    // 👥 KEYCLOAK ADMIN CLIENT - Pour gérer les users
    // ============================================

    /**
     * ✅ Bean Keycloak Admin Client
     * Service Account Flow - Authentification par Client Secret
     * Utilisé pour: register, update profile, delete user, etc.
     */
    @Bean
    public Keycloak keycloak() {
        System.out.println("\n🔑 ============================================");
        System.out.println("🔑 Initializing Keycloak Admin Client");
        System.out.println("   Environment: PRODUCTION");
        System.out.println("   Server: " + keycloakServerUrl);
        System.out.println("   Realm: " + keycloakRealm);
        System.out.println("   Client: " + adminClientId);
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
            System.err.println("❌ 3. Verify KEYCLOAK_ADMIN_CLIENT_SECRET is set");
            System.err.println("❌ 4. Check client has 'manage-users' and 'view-users' roles");
            System.err.println("❌ ============================================\n");
            e.printStackTrace();
            return null;
        }
    }
}