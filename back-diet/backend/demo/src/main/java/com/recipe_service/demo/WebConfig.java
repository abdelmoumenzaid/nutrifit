package com.recipe_service.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "https://front-end-production-0ec7.up.railway.app",  // ✅ AJOUTE
                "https://backend-production-44d4.up.railway.app",
                "http://localhost:4200",
                "http://localhost:3000",
                "http://localhost:8081"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true);  // ✅ Change à true
    }
}
