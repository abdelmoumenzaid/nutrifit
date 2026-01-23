package com.recipe_service.demo.nutrition;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipe_service.demo.recipe.Recipe;
import com.recipe_service.demo.recipe.RecipeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class NutritionService {

    @Value("${calorieninjas.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final RecipeRepository recipeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public NutritionService(RestTemplate restTemplate,
                            RecipeRepository recipeRepository) {
        this.restTemplate = restTemplate;
        this.recipeRepository = recipeRepository;
    }

    // Calcul des macros pour UNE recette
    public void computeNutritionForRecipe(Recipe recipe) throws Exception {
        String ingredientsJson = recipe.getIngredientsJson();
        if (ingredientsJson == null || ingredientsJson.isBlank()) {
            return;
        }

        // ingredientsJson = [{ "name": "...", "quantity": 200.0, "unit": "g" }, ...]
        JsonNode root = objectMapper.readTree(ingredientsJson);
        if (!root.isArray() || root.size() == 0) {
            return;
        }

        // Construire la query pour CalorieNinjas, ex: "200 g chicken, 2 tbsp olive oil"
        List<String> parts = new ArrayList<>();
        for (JsonNode ing : root) {
            String name = ing.path("name").asText("");
            double qty = ing.path("quantity").asDouble(0);
            String unit = ing.path("unit").asText("");

            if (name.isBlank() || qty <= 0) continue;

            String part = qty + " " + unit + " " + name;
            parts.add(part);
        }

        if (parts.isEmpty()) {
            return;
        }

        String query = String.join(", ", parts);
        System.out.println("CalorieNinjas query = " + query);  // <--- AJOUT

        // Appel CalorieNinjas
        String url = "https://api.calorieninjas.com/v1/nutrition?query=" +
                java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            return;
        }

        JsonNode body = objectMapper.readTree(response.getBody());
        JsonNode items = body.path("items");

        if (!items.isArray() || items.size() == 0) {
            return;
        }

        double totalCalories = 0;
        double totalProtein = 0;
        double totalCarbs = 0;
        double totalFat = 0;

        for (JsonNode item : items) {
            totalCalories += item.path("calories").asDouble(0);
            totalProtein  += item.path("protein_g").asDouble(0);
            totalCarbs    += item.path("carbohydrates_total_g").asDouble(0);
            totalFat      += item.path("fat_total_g").asDouble(0);
        }

        recipe.setCalories((int) Math.round(totalCalories));
        recipe.setProteinG((int) Math.round(totalProtein));
        recipe.setCarbsG((int) Math.round(totalCarbs));
        recipe.setFatG((int) Math.round(totalFat));

        recipeRepository.save(recipe);
    }

    // Calcul pour TOUTES les recettes
    public void computeNutritionForAllRecipes() {
        List<Recipe> all = recipeRepository.findAll();
        for (Recipe r : all) {
            try {
                computeNutritionForRecipe(r);
                System.out.println("CalorieNinjas API key = " + apiKey);
            } catch (Exception e) {
                System.err.println("Erreur nutrition recette " + r.getId() + " : " + e.getMessage());
            }
        }
    }
}

