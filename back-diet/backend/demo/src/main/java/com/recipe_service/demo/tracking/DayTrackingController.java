package com.recipe_service.demo.tracking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/day-tracking")
@CrossOrigin(origins = "*")  // ✅ CORS OK pour localhost:4200
public class DayTrackingController {

    @Autowired
    private DayTrackingService service;

    /**
     * GET /api/day-tracking/{date}
     */
    @GetMapping("/{date}")
    public ResponseEntity<DayTrackingDto> getDayTracking(@PathVariable String date) {
        try {
            UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            LocalDate day = LocalDate.parse(date);
            return ResponseEntity.ok(service.getOrCreateTracking(userId, day));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * ✅ GET /api/day-tracking/{date}/meals/{mealId} - Récupère 1 repas
     */
    @GetMapping("/{date}/meals/{mealId}")
    public ResponseEntity<DayMealDto> getMeal(@PathVariable String date, @PathVariable String mealId) {
        try {
            UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            LocalDate day = LocalDate.parse(date);
            DayTrackingDto tracking = service.getOrCreateTracking(userId, day);
            
            // Trouve le repas
            DayMealDto meal = tracking.getMeals().stream()
                .filter(m -> m.getId().toString().equals(mealId))
                .findFirst()
                .orElse(null);
                
            return meal != null ? ResponseEntity.ok(meal) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * ✅ PUT /api/day-tracking/{date}/meals/{mealId} - MODIFIE repas existant
     */
    @PutMapping("/{date}/meals/{mealId}")
    public ResponseEntity<DayTrackingDto> updateMeal(
            @PathVariable String date,
            @PathVariable String mealId,
            @RequestBody DayMealDto mealDto) {
        try {
            System.out.println("📥 UPDATE Meal " + mealId + ": " + mealDto.getRecipeName());
            UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            LocalDate day = LocalDate.parse(date);
            DayTrackingDto result = service.updateMeal(userId, day, mealId, mealDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    @DeleteMapping("/{date}/meals/{mealId}")
    public ResponseEntity<DayTrackingDto> deleteMeal(
            @PathVariable String date,
            @PathVariable String mealId) {
        try {
            System.out.println("🗑️ Deleting meal " + mealId);
            UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            LocalDate day = LocalDate.parse(date);
            DayTrackingDto result = service.deleteMeal(userId, day, mealId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * POST /api/day-tracking/{date}/meals
     */
    @PostMapping("/{date}/meals")
    public ResponseEntity<DayTrackingDto> addMeal(
            @PathVariable String date,
            @RequestBody DayMealDto mealDto) {
        try {
            System.out.println("📥 Meal reçu: " + mealDto.getRecipeName());
            UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            LocalDate day = LocalDate.parse(date);
            DayTrackingDto result = service.addMeal(userId, day, mealDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * POST /api/day-tracking/{date}/workouts
     */
    @PostMapping("/{date}/workouts")
    public ResponseEntity<DayTrackingDto> addWorkout(
            @PathVariable String date,
            @RequestBody DayWorkoutDto workoutDto) {
        try {
            System.out.println("📥 Workout reçu: " + workoutDto.getName());
            UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            LocalDate day = LocalDate.parse(date);
            DayTrackingDto result = service.addWorkout(userId, day, workoutDto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}
