package com.recipe_service.demo.recipe;

import org.springframework.data.jpa.domain.Specification;

public class RecipeSpecification {

    public static Specification<Recipe> titleContainsIgnoreCase(String value) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("title")), "%" + value.toLowerCase() + "%");
    }

    public static Specification<Recipe> categoryEquals(String value) {
        return (root, query, cb) ->
                cb.equal(root.get("category"), value);
    }

    public static Specification<Recipe> areaEquals(String value) {
        return (root, query, cb) ->
                cb.equal(root.get("area"), value);
    }

    public static Specification<Recipe> caloriesLessThan(Integer value) {
        return (root, query, cb) ->
                cb.lessThan(root.get("calories"), value);
    }

    public static Specification<Recipe> caloriesGreaterThan(Integer value) {
        return (root, query, cb) ->
                cb.greaterThan(root.get("calories"), value);
    }
}
