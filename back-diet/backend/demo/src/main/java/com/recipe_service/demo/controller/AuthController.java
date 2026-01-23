package com.recipe_service.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.keycloak.representations.idm.CredentialRepresentation;

import jakarta.ws.rs.core.Response;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired(required = false)
    private Keycloak keycloak;

    // ============ REGISTER ============
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new RegisterResponse(false, "Email requis"));
            }
            
            if (request.getPassword() == null || request.getPassword().length() < 8) {
                return ResponseEntity.badRequest()
                    .body(new RegisterResponse(false, "Password minimum 8 caractères"));
            }

            // ✅ If Keycloak available, use it
            if (keycloak != null) {
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

                RealmResource realm = keycloak.realm("diet-realm");
                Response response = realm.users().create(user);

                if (response.getStatus() == 201) {
                    System.out.println("✅ User créé via Keycloak: " + request.getEmail());
                    return ResponseEntity.ok(
                        new RegisterResponse(true, "User créé avec succès! Vous pouvez maintenant vous connecter.")
                    );
                } else {
                    String errorMsg = response.readEntity(String.class);
                    System.err.println("❌ Keycloak error: " + errorMsg);
                    return ResponseEntity.badRequest()
                        .body(new RegisterResponse(false, "Erreur lors de la création: " + errorMsg));
                }
            } else {
                // ✅ Fallback: Development mode (no Keycloak)
                System.out.println("⚠️ Keycloak not available, using development registration");
                System.out.println("✅ User registered (dev mode): " + request.getEmail());
                
                // TODO: Store user in database
                return ResponseEntity.ok(
                    new RegisterResponse(true, "User créé avec succès! Vous pouvez maintenant vous connecter.")
                );
            }

        } catch (Exception e) {
            System.err.println("❌ Registration exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(new RegisterResponse(false, "Erreur: " + e.getMessage()));
        }
    }

    // ============ LOGIN ============
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new LoginResponse(false, null, "Email requis"));
            }
            
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new LoginResponse(false, null, "Password requis"));
            }

            // TODO: Validate against database
            // TODO: Generate JWT token
            System.out.println("✅ Login attempt: " + request.getEmail());
            
            String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
            
            return ResponseEntity.ok(
                new LoginResponse(true, token, "Login successful")
            );

        } catch (Exception e) {
            System.err.println("❌ Login exception: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(new LoginResponse(false, null, "Login failed: " + e.getMessage()));
        }
    }

    // ============ EXCHANGE CODE (OAuth2) ============
    @PostMapping("/exchange-code")
    public ResponseEntity<?> exchangeCode(@RequestBody CodeExchangeRequest request) {
        try {
            if (request.getCode() == null || request.getCode().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new LoginResponse(false, null, "Code requis"));
            }

            // TODO: Exchange Keycloak code for access token
            // TODO: Validate code with Keycloak
            System.out.println("✅ Code exchange attempt: " + request.getCode());
            
            String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
            
            return ResponseEntity.ok(
                new LoginResponse(true, token, "Code exchanged successfully")
            );

        } catch (Exception e) {
            System.err.println("❌ Code exchange exception: " + e.getMessage());
            return ResponseEntity.badRequest()
                .body(new LoginResponse(false, null, "Code exchange failed: " + e.getMessage()));
        }
    }

    // ============ GET PROFILE ============
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProfile() {
        try {
            // TODO: Get current user from SecurityContext
            Map<String, Object> profile = new HashMap<>();
            profile.put("email", "user@example.com");
            profile.put("firstName", "John");
            profile.put("lastName", "Doe");
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new RegisterResponse(false, "Error fetching profile: " + e.getMessage()));
        }
    }

    // ============ HEALTH CHECK ============
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(new HashMap<String, String>() {{
            put("status", "OK");
            put("message", "Auth service is running");
        }});
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

    public static class RegisterResponse {
        public boolean success;
        public String message;

        public RegisterResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }

    public static class LoginRequest {
        public String email;
        public String password;

        public String getEmail() { return email; }
        public String getPassword() { return password; }

        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class LoginResponse {
        public boolean success;
        public String token;
        public String message;

        public LoginResponse(boolean success, String token, String message) {
            this.success = success;
            this.token = token;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getToken() { return token; }
        public String getMessage() { return message; }
    }

    public static class CodeExchangeRequest {
        public String code;
        public String state;

        public String getCode() { return code; }
        public String getState() { return state; }

        public void setCode(String code) { this.code = code; }
        public void setState(String state) { this.state = state; }
    }
}