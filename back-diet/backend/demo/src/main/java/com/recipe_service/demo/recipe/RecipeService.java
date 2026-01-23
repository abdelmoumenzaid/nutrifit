package com.recipe_service.demo.recipe;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    private final RecipeRepository repository;

    public RecipeService(RecipeRepository repository) {
        this.repository = repository;
    }

    public List<RecipeResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RecipeResponse findById(UUID id) {
        Recipe recipe = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return toResponse(recipe);
    }

    // --- création avec éventuel externalId (TheMealDB, etc.) ---
    public RecipeResponse create(RecipeCreateRequest req, String externalId) {
        if (externalId != null) {
            var existing = repository.findByExternalId(externalId);
            if (existing.isPresent()) {
                return toResponse(existing.get());
            }
        }

        Recipe recipe = new Recipe();
        recipe.setTitle(req.getTitle());
        recipe.setShortDescription(req.getShortDescription());
        recipe.setImageUrl(req.getImageUrl());
        recipe.setSource(req.getSource());
        recipe.setServings(req.getServings());
        recipe.setCalories(req.getCalories());
        recipe.setPrepMinutes(req.getPrepMinutes());
        recipe.setCookMinutes(req.getCookMinutes());
        recipe.setProteinG(req.getProteinG());
        recipe.setCarbsG(req.getCarbsG());
        recipe.setFatG(req.getFatG());
        recipe.setExternalId(externalId);
        recipe.setCategory(req.getCategory());
        recipe.setArea(req.getArea());
        recipe.setTags(req.getTags());
        recipe.setInstructions(req.getInstructions());
        recipe.setIngredientsJson(req.getIngredientsJson());

        Recipe saved = repository.save(recipe);
        return toResponse(saved);
    }

    // --- utilisée par ton POST normal /api/recipes ---
    public RecipeResponse create(RecipeCreateRequest req) {
        return create(req, null);
    }
    // --- obtenir la liste des catégories distinctes ---
    public List<String> getAllCategories() {
        return repository.findDistinctCategories();
    }
    // --- recherche dynamique avec query language : search=title:poulet,category:Vegetarian,calories<700 ---
    public List<RecipeResponse> search(String searchQuery) {
        Specification<Recipe> spec = RecipeSearchCriteriaParser.parse(searchQuery);

        List<Recipe> recipes;
        if (spec == null) {
            recipes = repository.findAll();
        } else {
            recipes = repository.findAll(spec);
        }

        return recipes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RecipeResponse toResponse(Recipe r) {
    return new RecipeResponse(
        r.getId(),
        r.getTitle(),
        r.getShortDescription(),
        r.getImageUrl(),
        r.getSource(),
        r.getServings(),
        r.getCalories(),
        r.getPrepMinutes(),
        r.getCookMinutes(),
        r.getProteinG(),
        r.getCarbsG(),
        r.getFatG(),
        r.getCategory(),
        r.getArea(),
        r.getTags(),
        r.getInstructions(),
        r.getIngredientsJson()
    );
}

}
