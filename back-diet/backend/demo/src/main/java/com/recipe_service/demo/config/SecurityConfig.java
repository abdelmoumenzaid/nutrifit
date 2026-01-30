package com.recipe_service.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // ✅ Enable @PreAuthorize
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ✅ Disable CSRF for API (stateless)
            .csrf(csrf -> csrf.disable())
            
            // ✅ Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // ✅ Stateless session (JWT doesn't need sessions)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // ✅ Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - no auth required
                .requestMatchers("/api/public/auth/register").permitAll()
                .requestMatchers("/api/public/auth/login").permitAll()
                .requestMatchers("/api/public/auth/exchange-code").permitAll()
                .requestMatchers("/api/public/auth/health").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                
                
                // Protected endpoints - require authentication
                .requestMatchers("/api/protected/**").authenticated()
                .requestMatchers("/api/*/profile").authenticated()
                
                // Everything else - allow for now (dev mode)
                .anyRequest().permitAll()
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // ✅ Frontend URLs - PRODUCTION + DEVELOPMENT
        config.setAllowedOrigins(Arrays.asList(
            // 🚀 PRODUCTION
            "https://front-end-production-0ec7.up.railway.app",
            "https://backend-production-44d4.up.railway.app",
            
            // 💻 DEVELOPMENT
            "http://localhost:4200",
            "http://localhost:3000",
            "http://localhost:8081"
        ));
        
        // ✅ Allow specific methods
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // ✅ Allow specific headers
        config.setAllowedHeaders(Arrays.asList(
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin"
        ));
        
        // ✅ Allow credentials (for cookies if needed)
        config.setAllowCredentials(true);
        
        // ✅ Cache CORS preflight for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}