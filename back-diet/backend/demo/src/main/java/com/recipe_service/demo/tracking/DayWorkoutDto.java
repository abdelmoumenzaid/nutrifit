package com.recipe_service.demo.tracking;

import java.util.UUID;

public class DayWorkoutDto {
    public UUID id;
    public String name;
    public String time;
    public Integer durationMin;
    public Integer caloriesBurned;
    public Integer totalSets;

    // ✅ TOUS LES GETTERS (OBLIGATOIRES)
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getTime() { return time; }
    public Integer getDurationMin() { return durationMin; }
    public Integer getCaloriesBurned() { return caloriesBurned; }
    public Integer getTotalSets() { return totalSets; }

    // ✅ SETTERS (POUR LA SÉCURITÉ)
    public void setId(UUID id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setTime(String time) { this.time = time; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }
    public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }
    public void setTotalSets(Integer totalSets) { this.totalSets = totalSets; }

    public static DayWorkoutDto fromEntity(DayWorkout entity) {
        DayWorkoutDto dto = new DayWorkoutDto();
        dto.id = entity.getId();
        dto.name = entity.getName();
        dto.time = entity.getTime();
        dto.durationMin = entity.getDurationMin();
        dto.caloriesBurned = entity.getCaloriesBurned();
        dto.totalSets = entity.getTotalSets();
        return dto;
    }
}
