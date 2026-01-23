package com.recipe_service.demo.recipe;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecipeRepository
        extends JpaRepository<Recipe, UUID>, JpaSpecificationExecutor<Recipe> {

    Optional<Recipe> findByExternalId(String externalId);
    List<Recipe> findTop10ByTitleContainingIgnoreCaseOrTagsContainingIgnoreCase(
            String title,
            String tags
    );
    @Query("SELECT DISTINCT r.category FROM Recipe r WHERE r.category IS NOT NULL")
    List<String> findDistinctCategories();
}
