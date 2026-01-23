package com.recipe_service.demo.tracking;

import java.util.UUID;

public class DayMealDto {
    private UUID id;
    private String recipeName;
    private String label;
    private String time;
    private Integer calories;
    private Integer servings;
    private Integer protein;
    private Integer carbs;
    private Integer fat;
    private String imageUrl;  // ✅ AJOUTÉ

    // ✅ fromEntity CORRIGÉ
    public static DayMealDto fromEntity(DayMeal entity) {
        DayMealDto dto = new DayMealDto();
        dto.setId(entity.getId());
        dto.setRecipeName(entity.getRecipeName());
        dto.setLabel(entity.getLabel());
        dto.setTime(entity.getTime());
        dto.setCalories(entity.getCalories());
        dto.setServings(entity.getServings());
        dto.setProtein(entity.getProtein());
        dto.setCarbs(entity.getCarbs());
        dto.setFat(entity.getFat());
        dto.setImageUrl(entity.getImageUrl());  // ✅ AJOUTÉ
        return dto;
    }

    // Getters/Setters existants...
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getRecipeName() { return recipeName; }
    public void setRecipeName(String recipeName) { this.recipeName = recipeName; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }
    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }
    public Integer getProtein() { return protein; }
    public void setProtein(Integer protein) { this.protein = protein; }
    public Integer getCarbs() { return carbs; }
    public void setCarbs(Integer carbs) { this.carbs = carbs; }
    public Integer getFat() { return fat; }
    public void setFat(Integer fat) { this.fat = fat; }

    // ✅ AJOUTÉ
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
