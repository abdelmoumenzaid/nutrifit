package com.recipe_service.demo.recipe;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecipeRepository
        extends JpaRepository<Recipe, UUID>, JpaSpecificationExecutor<Recipe> {
    
    // ✅ Pagination automatiquement héritée de JpaRepository:
    // Page<Recipe> findAll(Pageable pageable);
    
    // ✅ Pagination automatiquement héritée de JpaSpecificationExecutor:
    // Page<Recipe> findAll(Specification<Recipe> spec, Pageable pageable);

    Optional<Recipe> findByExternalId(String externalId);

    List<Recipe> findTop10ByTitleContainingIgnoreCaseOrTagsContainingIgnoreCase(
            String title,
            String tags
    );

    @Query("SELECT DISTINCT r.category FROM Recipe r WHERE r.category IS NOT NULL")
    List<String> findDistinctCategories();
}