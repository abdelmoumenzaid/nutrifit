package com.recipe_service.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * ✅ APPLICATION PRINCIPALE - Configure tous les modules
 */
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.recipe_service.demo.controller",  // ✅ ADD THIS LINE
    "com.recipe_service.demo.tracking",    // ✅ DayTracking
    "com.recipe_service.demo.recipe",      // ✅ Recipes
    "com.recipe_service.demo.nutrition",   // ✅ Nutrition
    "com.recipe_service.demo.ai",          // ✅ AI CONTROLLERS ← IMPORTANT !
    "com.recipe_service.demo.admin",       // ✅ Admin
    "com.recipe_service.demo.config",       // ✅ CORS, RestTemplate
    "com.recipe_service.demo.translation", // ✅ Translations
    "com.recipe_service.demo.image",        // ✅ Image Handling"
})
@EnableJpaRepositories(basePackages = {
    "com.recipe_service.demo.tracking",
    "com.recipe_service.demo.recipe",
    "com.recipe_service.demo.translation",
})
public class RecipeServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecipeServiceApplication.class, args);
    }
}
