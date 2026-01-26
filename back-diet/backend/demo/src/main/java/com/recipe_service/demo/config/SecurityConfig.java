package com.recipe_service.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * 🔐 SecurityConfig - Configuration Spring Security
 * ✅ CORS configuré
 * ✅ JWT Authentication
 * ✅ /api/public/** = Sans authentification (mais JWT peut être présent)
 * ✅ /api/recipes/** = Avec authentification JWT
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(Arrays.asList(
            "https://front-end-production-0ec7.up.railway.app",
            "https://backend-production-44d4.up.railway.app",
            "http://localhost:4200",
            "http://localhost:39876",
            "http://localhost:3000",
            "http://localhost:8081",
            "http://localhost:8080"
        ));
        
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Cache-Control",
            "Accept-Encoding",
            "Accept-Language",
            "Connection",
            "Host"
        ));
        
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Content-Length",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 🔐 Authorization Rules
            .authorizeHttpRequests(auth -> auth
                // ✅ PUBLIC endpoints (pas d'authentification requise)
                .requestMatchers(
                    "/api/public/auth/login",
                    "/api/public/auth/register",
                    "/api/public/auth/refresh",
                    "/api/public/auth/exchange-code",
                    "/api/public/auth/health",
                    "/api/public/health",
                    "/api/images/url/**",
                    "/static/**",
                    "/favicon.ico",
                    "/health"
                ).permitAll()
                
                // 🔑 PROTECTED endpoints (authentification JWT requise)
                .requestMatchers(
                    "/api/public/auth/profile",
                    "/api/public/auth/logout"
                ).authenticated()
                
                .requestMatchers(
                    "/api/recipes/**",
                    "/api/tracking/**",
                    "/api/admin/**"
                ).authenticated()
                
                // Par défaut: authentification requise
                .anyRequest().authenticated()
            )
            
            // 🔐 OAuth2 Resource Server (JWT validation)
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            )
            
            // 🔐 Exception Handling
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\": \"Non authentifié\", \"message\": \"" + authException.getMessage() + "\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\": \"Accès refusé\", \"message\": \"" + accessDeniedException.getMessage() + "\"}");
                })
            );

        return http.build();
    }
}