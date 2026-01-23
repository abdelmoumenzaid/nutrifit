package com.recipe_service.demo.recipe;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "short_description", length = 1000)
    private String shortDescription;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false, length = 20)
    private String source; // WEB, AI, USER, PHOTO

    @Column(nullable = false)
    private int servings;

    @Column
    private Integer calories;
    @Column(name = "prep_minutes")
    private Integer prepMinutes;

    @Column(name = "cook_minutes")
    private Integer cookMinutes;

    @Column(name = "protein_g")
    private Integer proteinG;

    @Column(name = "carbs_g")
    private Integer carbsG;

    @Column(name = "fat_g")
    private Integer fatG;

    
    @Column(name = "external_id", unique = true)
    private String externalId;

    @Column(name = "category")
    private String category;   // ex: "Lamb", "Side", "Dessert"

    @Column(name = "area")
    private String area;       // ex: "Turkish", "Chinese"

    @Column(name = "tags")
    private String tags;       // ex: "Spicy,Grill"

    // texte long pour les instructions
    @Lob
    @Column(name = "instructions")
    private String instructions;

    // JSON texte pour stocker les ingrédients (nom + quantité)
    @Lob
    @Column(name = "ingredients_json")
    private String ingredientsJson;

    public Recipe() {
    }

    public Recipe(String title,
                  String shortDescription,
                  String imageUrl,
                  String source,
                  int servings,
                  Integer calories) {
        this.title = title;
        this.shortDescription = shortDescription;
        this.imageUrl = imageUrl;
        this.source = source;
        this.servings = servings;
        this.calories = calories;
    }

    public UUID getId() {
        return id;
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
    public String getExternalId() {
    return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }


    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getIngredientsJson() { return ingredientsJson; }
    public void setIngredientsJson(String ingredientsJson) { this.ingredientsJson = ingredientsJson; }
}
