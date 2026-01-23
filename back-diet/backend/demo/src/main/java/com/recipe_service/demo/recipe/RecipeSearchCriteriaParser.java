package com.recipe_service.demo.recipe;

import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class RecipeSearchCriteriaParser {

    // search=title:poulet,category:Vegetarian,calories<700
    public static Specification<Recipe> parse(String search) {
        if (search == null || search.isBlank()) {
            return null; // pas de filtre
        }

        String[] tokens = search.split(",");
        List<Specification<Recipe>> specs = new ArrayList<>();

        for (String token : tokens) {
            token = token.trim();
            if (token.isEmpty()) continue;

            if (token.startsWith("title:")) {
                String value = token.substring("title:".length());
                specs.add(RecipeSpecification.titleContainsIgnoreCase(value));
            } else if (token.startsWith("category:")) {
                String value = token.substring("category:".length());
                specs.add(RecipeSpecification.categoryEquals(value));
            } else if (token.startsWith("area:")) {
                String value = token.substring("area:".length());
                specs.add(RecipeSpecification.areaEquals(value));
            } else if (token.startsWith("calories<")) {
                Integer value = Integer.valueOf(token.substring("calories<".length()));
                specs.add(RecipeSpecification.caloriesLessThan(value));
            } else if (token.startsWith("calories>")) {
                Integer value = Integer.valueOf(token.substring("calories>".length()));
                specs.add(RecipeSpecification.caloriesGreaterThan(value));
            }
            // tu pourras ajouter tags:, source:, etc. plus tard
        }

        if (specs.isEmpty()) {
            return null;
        }

        Specification<Recipe> result = specs.get(0);
        for (int i = 1; i < specs.size(); i++) {
            result = result.and(specs.get(i));
        }
        return result;
    }
}
