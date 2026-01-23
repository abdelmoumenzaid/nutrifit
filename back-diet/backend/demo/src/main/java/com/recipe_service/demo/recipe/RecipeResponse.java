package com.recipe_service.demo.recipe;

import java.util.UUID;

public class RecipeResponse {

    private UUID id;
    private String title;
    private String shortDescription;
    private String imageUrl;
    private String source;
    private int servings;
    private Integer calories;
    private Integer prepMinutes;
    private Integer cookMinutes;
    private Integer proteinG;
    private Integer carbsG;
    private Integer fatG;
    private String category;
    private String area;
    private String tags;
    private String instructions;
    private String ingredientsJson;


    public RecipeResponse() {
    }

    public RecipeResponse(UUID id,
                          String title,
                          String shortDescription,
                          String imageUrl,
                          String source,
                          int servings,
                          Integer calories,
                          Integer prepMinutes,
                          Integer cookMinutes,
                          Integer proteinG,
                          Integer carbsG,
                          Integer fatG,
                          String category,  
                          String area,
                          String tags,
                          String instructions,
                          String ingredientsJson
                          ) {
        this.id = id;
        this.title = title;
        this.shortDescription = shortDescription;
        this.imageUrl = imageUrl;
        this.source = source;
        this.servings = servings;
        this.calories = calories;
        this.prepMinutes = prepMinutes;
        this.cookMinutes = cookMinutes;
        this.proteinG = proteinG;
        this.carbsG = carbsG;
        this.fatG = fatG;
        this.category = category;
        this.area = area;
        this.tags = tags;
        this.instructions = instructions;
        this.ingredientsJson = ingredientsJson;
    }

    // getters & setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public int getServings() {
        return servings;
    }

    public void setServings(int servings) {
        this.servings = servings;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public Integer getPrepMinutes() {
        return prepMinutes;
    }

    public void setPrepMinutes(Integer prepMinutes) {
        this.prepMinutes = prepMinutes;
    }

    public Integer getCookMinutes() {
        return cookMinutes;
    }

    public void setCookMinutes(Integer cookMinutes) {
        this.cookMinutes = cookMinutes;
    }

    public Integer getProteinG() {
        return proteinG;
    }

    public void setProteinG(Integer proteinG) {
        this.proteinG = proteinG;
    }

    public Integer getCarbsG() {
        return carbsG;
    }

    public void setCarbsG(Integer carbsG) {
        this.carbsG = carbsG;
    }

    public Integer getFatG() {
        return fatG;
    }

    public void setFatG(Integer fatG) {
        this.fatG = fatG;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }
    public String getArea() {
        return area;
    }
    public void setArea(String area) {
        this.area = area;
    }
    public String getTags() {
        return tags;
    }
    public void setTags(String tags) {
        this.tags = tags;
    }
    public String getInstructions() {
        return instructions;
    }   
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
    public String getIngredientsJson() {
        return ingredientsJson;
    }
    public void setIngredientsJson(String ingredientsJson) {
        this.ingredientsJson = ingredientsJson;
    }
}
