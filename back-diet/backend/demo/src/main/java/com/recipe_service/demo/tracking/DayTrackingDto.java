package com.recipe_service.demo.tracking;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class DayTrackingDto {
    public UUID id;
    public String date;
    public Integer caloriesIn;
    public Integer caloriesTarget;
    public Integer caloriesOut;
    public Integer totalWorkoutMinutes;
    public Integer totalSets;
    public List<DayMealDto> meals = new ArrayList<>();
    public List<DayWorkoutDto> workouts = new ArrayList<>();

    // ✅ TOUS LES GETTERS
    public UUID getId() { return id; }
    public String getDate() { return date; }
    public Integer getCaloriesIn() { return caloriesIn; }
    public Integer getCaloriesTarget() { return caloriesTarget; }
    public Integer getCaloriesOut() { return caloriesOut; }
    public Integer getTotalWorkoutMinutes() { return totalWorkoutMinutes; }
    public Integer getTotalSets() { return totalSets; }
    public List<DayMealDto> getMeals() { return meals; }
    public List<DayWorkoutDto> getWorkouts() { return workouts; }

    public static DayTrackingDto fromEntity(DayTracking entity) {
        DayTrackingDto dto = new DayTrackingDto();
        dto.id = entity.getId();
        dto.date = entity.getDate().toString();
        dto.caloriesIn = entity.getCaloriesIn();
        dto.caloriesTarget = entity.getCaloriesTarget();
        dto.caloriesOut = entity.getCaloriesOut();
        dto.totalWorkoutMinutes = entity.getTotalWorkoutMinutes();
        dto.totalSets = entity.getTotalSets();
        return dto;
    }
}
