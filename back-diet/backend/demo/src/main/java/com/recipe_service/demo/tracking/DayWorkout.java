package com.recipe_service.demo.tracking;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "day_workout")
public class DayWorkout {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "day_tracking_id", nullable = false)
    private UUID dayTrackingId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String time; // HH:mm format

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    @Column(name = "calories_burned")
    private Integer caloriesBurned;

    @Column(name = "total_sets", nullable = false)
    private Integer totalSets = 0;

    // Constructors
    public DayWorkout() {}

    public DayWorkout(UUID dayTrackingId, String name, String time, Integer durationMin) {
        this.dayTrackingId = dayTrackingId;
        this.name = name;
        this.time = time;
        this.durationMin = durationMin;
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getDayTrackingId() { return dayTrackingId; }
    public void setDayTrackingId(UUID dayTrackingId) { this.dayTrackingId = dayTrackingId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public Integer getDurationMin() { return durationMin; }
    public void setDurationMin(Integer durationMin) { this.durationMin = durationMin; }

    public Integer getCaloriesBurned() { return caloriesBurned; }
    public void setCaloriesBurned(Integer caloriesBurned) { this.caloriesBurned = caloriesBurned; }

    public Integer getTotalSets() { return totalSets; }
    public void setTotalSets(Integer totalSets) { this.totalSets = totalSets; }
}
