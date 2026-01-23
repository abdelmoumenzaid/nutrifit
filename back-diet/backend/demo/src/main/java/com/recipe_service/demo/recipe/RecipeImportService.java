package com.recipe_service.demo.recipe;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class RecipeImportService {

    private final TheMealDbClient mealDbClient;
    private final RecipeService recipeService;

    public RecipeImportService(TheMealDbClient mealDbClient,
                               RecipeService recipeService) {
        this.mealDbClient = mealDbClient;
        this.recipeService = recipeService;
    }

    public int importManyFromMealDb() {
        List<Character> letters = List.of(
                'a','b','c','d','e','f','g','h','i','j',
                'k','l','m','n','o','p','q','r','s','t',
                'u','v','w','x','y','z'
        );

        int count = 0;
        for (char letter : letters) {
            var meals = mealDbClient.searchByFirstLetter(letter);
            for (TheMealDbClient.MealDto meal : meals) {
                RecipeCreateRequest req = mapMealToRecipe(meal);
                recipeService.create(req, meal.idMeal); // <-- ici
                count++;
            }
        }
        return count;
    }

    private RecipeCreateRequest mapMealToRecipe(TheMealDbClient.MealDto m) {
        RecipeCreateRequest req = new RecipeCreateRequest();
        req.setTitle(m.strMeal);
        req.setShortDescription(
            (m.strCategory != null ? m.strCategory + " - " : "") +
            (m.strArea != null ? m.strArea + " - " : "") +
            "Recette importée de TheMealDB"
        );
        req.setImageUrl(m.strMealThumb);
        req.setSource("WEB");
        req.setServings(2);
        req.setCalories(600);

        req.setPrepMinutes(20);
        req.setCookMinutes(30);
        req.setProteinG(25);
        req.setCarbsG(60);
        req.setFatG(20);
        req.setCategory(m.strCategory);
        req.setArea(m.strArea);
        req.setTags(m.strTags);

        // 1) instructions brutes TheMealDB
        req.setInstructions(m.strInstructions);

        // 2) ingrédients : construire un petit JSON (nom + quantité)
        List<HashMap<String, String>> ingredients = new ArrayList<>();

        for (int i = 1; i <= 20; i++) {
            String name = m.getIngredient(i);   // à ajouter dans MealDto
            String measure = m.getMeasure(i);   // idem

            if (name != null && !name.isBlank()) {
                HashMap<String, String> ing = new HashMap<>();
                ing.put("name", name.trim());
                ing.put("quantity", measure != null ? measure.trim() : "");
                ingredients.add(ing);
            }
        }

        // 3) sérialisation JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            req.setIngredientsJson(mapper.writeValueAsString(ingredients));
        } catch (Exception e) {
            req.setIngredientsJson("[]");
        }

        return req;
    }

    
}
