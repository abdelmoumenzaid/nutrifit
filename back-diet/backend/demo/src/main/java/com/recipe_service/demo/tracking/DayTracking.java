package com.recipe_service.demo.tracking;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "day_tracking")
public class DayTracking {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "calories_target", nullable = false)
    private Integer caloriesTarget = 2100;

    @Column(name = "calories_in", nullable = false)
    private Integer caloriesIn = 0;

    @Column(name = "calories_out", nullable = false)
    private Integer caloriesOut = 0;

    @Column(name = "total_workout_minutes", nullable = false)
    private Integer totalWorkoutMinutes = 0;

    @Column(name = "total_sets", nullable = false)
    private Integer totalSets = 0;

    // Constructors
    public DayTracking() {}

    public DayTracking(UUID userId, LocalDate date) {
        this.userId = userId;
        this.date = date;
    }

    // Getters/Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getCaloriesTarget() { return caloriesTarget; }
    public void setCaloriesTarget(Integer caloriesTarget) { this.caloriesTarget = caloriesTarget; }

    public Integer getCaloriesIn() { return caloriesIn; }
    public void setCaloriesIn(Integer caloriesIn) { this.caloriesIn = caloriesIn; }

    public Integer getCaloriesOut() { return caloriesOut; }
    public void setCaloriesOut(Integer caloriesOut) { this.caloriesOut = caloriesOut; }

    public Integer getTotalWorkoutMinutes() { return totalWorkoutMinutes; }
    public void setTotalWorkoutMinutes(Integer totalWorkoutMinutes) { this.totalWorkoutMinutes = totalWorkoutMinutes; }

    public Integer getTotalSets() { return totalSets; }
    public void setTotalSets(Integer totalSets) { this.totalSets = totalSets; }
}
