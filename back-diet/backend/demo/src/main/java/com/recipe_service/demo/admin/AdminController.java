package com.recipe_service.demo.admin;

import com.recipe_service.demo.nutrition.NutritionService;
import com.recipe_service.demo.recipe.Recipe;
import com.recipe_service.demo.recipe.RecipeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final NutritionService nutritionService;
    private final RecipeRepository recipeRepository;

    public AdminController(NutritionService nutritionService,
                           RecipeRepository recipeRepository) {
        this.nutritionService = nutritionService;
        this.recipeRepository = recipeRepository;
    }

    @PostMapping("/recipes/{id}/compute-nutrition")
    public ResponseEntity<Recipe> computeNutritionForOne(@PathVariable UUID id) throws Exception {
        Recipe r = recipeRepository.findById(id).orElseThrow();
        nutritionService.computeNutritionForRecipe(r);
        return ResponseEntity.ok(r);
    }

    @PostMapping("/recipes/compute-nutrition-all")
    public ResponseEntity<Void> computeNutritionForAll() {
        nutritionService.computeNutritionForAllRecipes();
        return ResponseEntity.ok().build();
    }
}
