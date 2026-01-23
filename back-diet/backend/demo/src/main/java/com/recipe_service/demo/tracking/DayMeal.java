package com.recipe_service.demo.tracking;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "day_meal")
public class DayMeal {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "day_tracking_id", nullable = false)
    private UUID dayTrackingId;

    @Column(name = "recipe_name", nullable = false)
    private String recipeName;

    @Column(nullable = false)
    private String label; // BREAKFAST, LUNCH, DINNER, SNACK

    @Column(nullable = false)
    private String time; // HH:mm format

    @Column(nullable = false)
    private Integer calories;

    @Column(nullable = false)
    private Integer servings = 1;

    @Column(name = "protein")
    private Integer protein;

    @Column(name = "carbs")
    private Integer carbs;

    @Column(name = "fat")
    private Integer fat;

    // ✅ AJOUT 1 : imageUrl
    @Column(name = "image_url")
    private String imageUrl;

    // Constructors
    public DayMeal() {}

    public DayMeal(UUID dayTrackingId, String recipeName, String label, String time, Integer calories) {
        this.dayTrackingId = dayTrackingId;
        this.recipeName = recipeName;
        this.label = label;
        this.time = time;
        this.calories = calories;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getDayTrackingId() { return dayTrackingId; }
    public void setDayTrackingId(UUID dayTrackingId) { this.dayTrackingId = dayTrackingId; }

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

    // ✅ AJOUT 2 : imageUrl getters/setters
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
