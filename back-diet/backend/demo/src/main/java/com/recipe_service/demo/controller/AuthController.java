package com.recipe_service.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

// 🔧 IMPORTS MANQUANTS - À AJOUTER
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.keycloak.representations.idm.CredentialRepresentation;

import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * 🔐 AuthController - Gère l'authentification Keycloak
 * ✅ Login avec email/password
 * ✅ Registration
 * ✅ OAuth2 Code Exchange
 * ✅ Profile endpoint
 * ✅ Refresh token
 * ✅ Logout
 */
@RestController
@RequestMapping("/api/public/auth")
@CrossOrigin(origins = {
    "https://front-end-production-0ec7.up.railway.app",
    "https://backend-production-44d4.up.railway.app",
    "http://localhost:4200",
    "http://localhost:39876",
    "http://localhost:3000",
    "http://localhost:8081"
})
public class AuthController {

    @Autowired(required = false)
    private Keycloak keycloak;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${KEYCLOAK_SERVER_URL:http://localhost:8082}")
    private String keycloakServerUrl;

    @Value("${KEYCLOAK_REALM:nutrifit}")
    private String keycloakRealm;

    @Value("${KEYCLOAK_CLIENT_ID:frontend}")
    private String clientId;

    @Value("${KEYCLOAK_CLIENT_SECRET:}")
    private String clientSecret;

    // ============ HEALTH CHECK ============
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        System.out.println("🏥 Health check request");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Auth service is running");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("keycloak_server", keycloakServerUrl);
        response.put("keycloak_realm", keycloakRealm);

        return ResponseEntity.ok(response);
    }

    // ============ REGISTER ============
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            System.out.println("📤 Register request received: " + request.getEmail());

            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("❌ Email manquant");
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Email requis"));
            }

            if (!request.getEmail().contains("@")) {
                System.out.println("❌ Email invalide: " + request.getEmail());
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Email invalide"));
            }

            if (request.getPassword() == null || request.getPassword().length() < 8) {
                System.out.println("❌ Password trop court");
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Password minimum 8 caractères"));
            }

            if (keycloak != null) {
                System.out.println("🔐 Using Keycloak for registration");

                try {
                    UserRepresentation user = new UserRepresentation();
                    user.setUsername(request.getEmail());
                    user.setEmail(request.getEmail());
                    user.setFirstName(request.getFirstName() != null ? request.getFirstName() : "");
                    user.setLastName(request.getLastName() != null ? request.getLastName() : "");
                    user.setEnabled(true);
                    user.setEmailVerified(true);

                    CredentialRepresentation password = new CredentialRepresentation();
                    password.setTemporary(false);
                    password.setType(CredentialRepresentation.PASSWORD);
                    password.setValue(request.getPassword());
                    user.setCredentials(Collections.singletonList(password));

                    RealmResource realm = keycloak.realm(keycloakRealm);
                    Response keycloakResponse = realm.users().create(user);

                    if (keycloakResponse.getStatus() == 201) {
                        System.out.println("✅ User créé via Keycloak: " + request.getEmail());
                        return ResponseEntity.status(HttpStatus.CREATED)
                            .body(new ErrorResponse(true, "User créé avec succès! Vous pouvez maintenant vous connecter."));
                    } else {
                        String errorMsg = keycloakResponse.readEntity(String.class);
                        System.err.println("❌ Keycloak error: " + errorMsg);
                        return ResponseEntity.badRequest()
                            .body(new ErrorResponse(false, "Erreur lors de la création: " + errorMsg));
                    }

                } catch (Exception e) {
                    System.err.println("❌ Keycloak registration error: " + e.getMessage());
                    
                    if (e.getMessage().contains("User exists")) {
                        return ResponseEntity.badRequest()
                            .body(new ErrorResponse(false, "Cet email est déjà utilisé"));
                    }
                    
                    return ResponseEntity.badRequest()
                        .body(new ErrorResponse(false, "Erreur: " + e.getMessage()));
                }

            } else {
                System.out.println("⚠️ Keycloak not available, using development registration");
                System.out.println("✅ User registered (dev mode): " + request.getEmail());
                return ResponseEntity.ok(
                    new ErrorResponse(true, "User créé avec succès! Vous pouvez maintenant vous connecter.")
                );
            }

        } catch (Exception e) {
            System.err.println("❌ Registration exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(false, "Erreur serveur: " + e.getMessage()));
        }
    }

    // ============ LOGIN ============
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println("🔑 Login request: " + request.getEmail());

            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                System.out.println("❌ Email manquant");
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Email requis"));
            }

            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                System.out.println("❌ Password manquant");
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Password requis"));
            }

            String tokenEndpoint = keycloakServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/token";

            System.out.println("📡 Calling Keycloak token endpoint: " + tokenEndpoint);

            try {
                // 🔧 FIX: Utiliser MultiValueMap pour form-urlencoded
                MultiValueMap<String, String> tokenRequest = new LinkedMultiValueMap<>();
                tokenRequest.add("grant_type", "password");
                tokenRequest.add("client_id", clientId);
                tokenRequest.add("username", request.getEmail());
                tokenRequest.add("password", request.getPassword());

                System.out.println("🔐 Authenticating with Keycloak...");

                // 🔧 FIX: Ajouter les headers corrects
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                HttpEntity<MultiValueMap<String, String>> httpEntity = 
                    new HttpEntity<>(tokenRequest, headers);

                ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                    tokenEndpoint,
                    httpEntity,
                    Map.class
                );

                if (tokenResponse.getStatusCode().is2xxSuccessful() && tokenResponse.getBody() != null) {
                    Map<String, Object> body = tokenResponse.getBody();

                    if (body.containsKey("access_token")) {
                        String accessToken = (String) body.get("access_token");
                        String refreshToken = (String) body.get("refresh_token");
                        Object expiresInObj = body.get("expires_in");
                        Long expiresIn = expiresInObj instanceof Long ? (Long) expiresInObj : 
                                        expiresInObj instanceof Integer ? ((Integer) expiresInObj).longValue() : 300L;

                        System.out.println("✅ Login successful: " + request.getEmail());
                        System.out.println("🎫 Token obtained from Keycloak (expires in " + expiresIn + "s)");

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("token", accessToken);
                        response.put("refresh_token", refreshToken);
                        response.put("expires_in", expiresIn);
                        response.put("token_type", "Bearer");
                        response.put("message", "Connexion réussie!");

                        return ResponseEntity.ok(response);
                    }
                }

                System.err.println("❌ No access_token in response");
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Token non reçu de Keycloak"));

            } catch (HttpClientErrorException e) {
                System.err.println("❌ Keycloak authentication failed: " + e.getStatusCode());
                
                if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                    return ResponseEntity.badRequest()
                        .body(new ErrorResponse(false, "Email ou mot de passe incorrect"));
                }
                
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Erreur d'authentification: " + e.getMessage()));

            } catch (Exception e) {
                System.err.println("❌ Keycloak connection error: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse(false, "Service d'authentification indisponible"));
            }

        } catch (Exception e) {
            System.err.println("❌ Login exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(false, "Erreur serveur: " + e.getMessage()));
        }
    }

    // ============ REFRESH TOKEN ============
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            System.out.println("🔄 Refresh token request");

            if (request.getRefreshToken() == null || request.getRefreshToken().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Refresh token requis"));
            }

            String tokenEndpoint = keycloakServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/token";

            try {
                MultiValueMap<String, String> tokenRequest = new LinkedMultiValueMap<>();
                tokenRequest.add("grant_type", "refresh_token");
                tokenRequest.add("client_id", clientId);
                tokenRequest.add("refresh_token", request.getRefreshToken());

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                HttpEntity<MultiValueMap<String, String>> httpEntity = 
                    new HttpEntity<>(tokenRequest, headers);

                ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                    tokenEndpoint,
                    httpEntity,
                    Map.class
                );

                if (tokenResponse.getStatusCode().is2xxSuccessful() && tokenResponse.getBody() != null) {
                    Map<String, Object> body = tokenResponse.getBody();

                    if (body.containsKey("access_token")) {
                        String accessToken = (String) body.get("access_token");
                        String refreshToken = (String) body.get("refresh_token");
                        Long expiresIn = ((Number) body.get("expires_in")).longValue();

                        System.out.println("✅ Token refreshed successfully");

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("token", accessToken);
                        response.put("refresh_token", refreshToken);
                        response.put("expires_in", expiresIn);
                        response.put("message", "Token rafraîchi");

                        return ResponseEntity.ok(response);
                    }
                }

                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Token non reçu"));

            } catch (Exception e) {
                System.err.println("❌ Token refresh failed: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(false, "Refresh token expiré ou invalide"));
            }

        } catch (Exception e) {
            System.err.println("❌ Refresh exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(false, "Erreur serveur: " + e.getMessage()));
        }
    }

    // ============ EXCHANGE CODE (OAuth2) ============
    @PostMapping("/exchange-code")
    public ResponseEntity<?> exchangeCode(@RequestBody CodeExchangeRequest request) {
        try {
            System.out.println("🔄 Code exchange request");

            if (request.getCode() == null || request.getCode().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Code requis"));
            }

            String tokenEndpoint = keycloakServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/token";

            try {
                MultiValueMap<String, String> tokenRequest = new LinkedMultiValueMap<>();
                tokenRequest.add("grant_type", "authorization_code");
                tokenRequest.add("client_id", clientId);
                tokenRequest.add("code", request.getCode());
                tokenRequest.add("redirect_uri", "http://localhost:4200/callback");

                if (clientSecret != null && !clientSecret.isEmpty()) {
                    tokenRequest.add("client_secret", clientSecret);
                }

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                HttpEntity<MultiValueMap<String, String>> httpEntity = 
                    new HttpEntity<>(tokenRequest, headers);

                ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                    tokenEndpoint,
                    httpEntity,
                    Map.class
                );

                if (tokenResponse.getStatusCode().is2xxSuccessful() && tokenResponse.getBody() != null) {
                    Map<String, Object> body = tokenResponse.getBody();

                    if (body.containsKey("access_token")) {
                        String accessToken = (String) body.get("access_token");
                        String refreshToken = (String) body.get("refresh_token");
                        Long expiresIn = ((Number) body.get("expires_in")).longValue();

                        System.out.println("✅ Code exchanged successfully");

                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("token", accessToken);
                        response.put("refresh_token", refreshToken);
                        response.put("expires_in", expiresIn);
                        response.put("message", "Code exchanged successfully");

                        return ResponseEntity.ok(response);
                    }
                }

                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Token non reçu"));

            } catch (Exception e) {
                System.err.println("❌ Code exchange failed: " + e.getMessage());
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse(false, "Erreur lors de l'échange du code"));
            }

        } catch (Exception e) {
            System.err.println("❌ Code exchange exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(false, "Erreur serveur: " + e.getMessage()));
        }
    }

    // ============ GET PROFILE ============
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfile() {
        try {
            System.out.println("👤 [DEBUG] Profile request");
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            System.out.println("🔍 [DEBUG] Authentication type: " + 
                (authentication != null ? authentication.getClass().getSimpleName() : "NULL"));
            System.out.println("🔍 [DEBUG] Is authenticated: " + 
                (authentication != null ? authentication.isAuthenticated() : false));

            if (authentication == null || !authentication.isAuthenticated()) {
                System.err.println("❌ [ERROR] No authentication or not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(false, "Authentification requise"));
            }

            Map<String, Object> profile = new HashMap<>();

            if (authentication instanceof JwtAuthenticationToken) {
                System.out.println("✅ [DEBUG] Using JwtAuthenticationToken");
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                Jwt jwt = jwtAuth.getToken();

                String email = jwt.getClaimAsString("email");
                String preferredUsername = jwt.getClaimAsString("preferred_username");
                String givenName = jwt.getClaimAsString("given_name");
                String familyName = jwt.getClaimAsString("family_name");
                String subject = jwt.getSubject();

                profile.put("email", email != null ? email : preferredUsername);
                profile.put("firstName", givenName != null ? givenName : "User");
                profile.put("lastName", familyName != null ? familyName : "");
                profile.put("username", preferredUsername != null ? preferredUsername : subject);
                profile.put("userId", subject);

                try {
                    Object realmAccess = jwt.getClaim("realm_access");
                    if (realmAccess instanceof Map<?, ?>) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> map = (Map<String, Object>) realmAccess;
                        Object rolesObj = map.get("roles");
                        if (rolesObj instanceof java.util.Collection<?>) {
                            profile.put("roles", rolesObj);
                        } else {
                            profile.put("roles", new ArrayList<>());
                        }
                    } else {
                        profile.put("roles", new ArrayList<>());
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ [WARN] Could not extract roles: " + e.getMessage());
                    profile.put("roles", new ArrayList<>());
                }

                System.out.println("✅ [SUCCESS] Profile extracted from JWT");
                return ResponseEntity.ok(profile);
            }

            System.out.println("ℹ️ [INFO] Using fallback");
            profile.put("email", authentication.getName());
            profile.put("firstName", "User");
            profile.put("lastName", "");
            profile.put("username", authentication.getName());
            profile.put("authorities", authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.toList()));

            System.out.println("✅ [SUCCESS] Profile returned (fallback)");
            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            System.err.println("❌ [ERROR] Exception fetching profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(false, "Erreur serveur: " + e.getMessage()));
        }
    }

    // ============ LOGOUT ============
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            System.out.println("🚪 Logout request");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Déconnexion réussie");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Logout exception: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(false, "Erreur serveur: " + e.getMessage()));
        }
    }

    // ============ TEST JWT GENERATION ============
    @GetMapping("/test-jwt")
    public ResponseEntity<?> testJwt() {
        try {
            String secret = "my-secret-key-for-jwt-token-generation-2024-2025";
            
            SecretKeySpec key = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                0,
                secret.getBytes(StandardCharsets.UTF_8).length,
                "HmacSHA256"
            );
            
            // Créer un token test
            String token = Jwts.builder()
                .subject("test-user")
                .claim("email", "test@example.com")
                .claim("preferred_username", "test@example.com")
                .claim("given_name", "Test")
                .claim("family_name", "User")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
            
            System.out.println("✅ Generated Test Token:");
            System.out.println(token);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Test token generated");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error generating test token: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    // ============ REQUEST/RESPONSE CLASSES ============
    
    public static class RegisterRequest {
        public String email;
        public String firstName;
        public String lastName;
        public String password;

        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getPassword() { return password; }

        public void setEmail(String email) { this.email = email; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginRequest {
        public String email;
        public String password;

        public String getEmail() { return email; }
        public String getPassword() { return password; }

        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RefreshTokenRequest {
        public String refreshToken;

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    public static class CodeExchangeRequest {
        public String code;
        public String state;

        public String getCode() { return code; }
        public String getState() { return state; }

        public void setCode(String code) { this.code = code; }
        public void setState(String state) { this.state = state; }
    }

    public static class ErrorResponse {
        public boolean success;
        public String message;
        public LocalDateTime timestamp;

        public ErrorResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
            this.timestamp = LocalDateTime.now();
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
}