package com.recipe_service.demo.tracking;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DayTrackingService {

    @Autowired
    private DayTrackingRepository trackingRepo;

    @Autowired
    private DayMealRepository mealRepo;

    @Autowired
    private DayWorkoutRepository workoutRepo;

    public DayTrackingDto getOrCreateTracking(UUID userId, LocalDate date) {
        Optional<DayTracking> tracking = trackingRepo.findByUserIdAndDate(userId, date);
        return tracking.map(this::entityToDto)
                .orElseGet(() -> {
                    DayTracking empty = new DayTracking(userId, date);
                    trackingRepo.save(empty);
                    return entityToDto(empty);
                });
    }

    /**
     * ✅ CORRIGÉ : save() avec userId/date corrects
     */
    public DayTrackingDto save(DayTrackingDto dto) {
        UUID userId = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
        LocalDate date = LocalDate.parse(dto.getDate());

        DayTracking entity = trackingRepo.findByUserIdAndDate(userId, date)
                .orElseGet(() -> new DayTracking(userId, date));  // ✅ CORRIGÉ

        entity.setCaloriesIn(dto.getCaloriesIn());
        entity.setCaloriesTarget(dto.getCaloriesTarget());
        entity.setCaloriesOut(dto.getCaloriesOut() != null ? dto.getCaloriesOut() : 0);
        entity.setTotalWorkoutMinutes(dto.getTotalWorkoutMinutes() != null ? dto.getTotalWorkoutMinutes() : 0);
        entity.setTotalSets(dto.getTotalSets() != null ? dto.getTotalSets() : 0);

        DayTracking saved = trackingRepo.save(entity);
        return entityToDto(saved);
    }

    /**
     * ✅ CORRIGÉ : Retourne DayTrackingDto COMPLET + imageUrl
     */
    public DayTrackingDto addMeal(UUID userId, LocalDate date, DayMealDto mealDto) {
        System.out.println("📥 Adding meal: " + mealDto.getRecipeName());

        // Récupérer ou créer le DayTracking
        DayTracking tracking = trackingRepo.findByUserIdAndDate(userId, date)
                .orElseGet(() -> {
                    DayTracking newTracking = new DayTracking(userId, date);
                    return trackingRepo.save(newTracking);
                });

        // Créer le repas ✅ AVEC imageUrl
        DayMeal meal = new DayMeal();
        meal.setDayTrackingId(tracking.getId());
        meal.setRecipeName(mealDto.getRecipeName());
        meal.setLabel(mealDto.getLabel());
        meal.setTime(mealDto.getTime());
        meal.setCalories(mealDto.getCalories());
        meal.setServings(mealDto.getServings() != null ? mealDto.getServings() : 1);
        if (mealDto.getProtein() != null) meal.setProtein(mealDto.getProtein());
        if (mealDto.getCarbs() != null) meal.setCarbs(mealDto.getCarbs());
        if (mealDto.getFat() != null) meal.setFat(mealDto.getFat());
        if (mealDto.getImageUrl() != null) meal.setImageUrl(mealDto.getImageUrl());  // ✅ AJOUTÉ

        DayMeal savedMeal = mealRepo.save(meal);
        System.out.println("✅ Meal saved: " + savedMeal.getId());

        // Mettre à jour les calories totales
        updateDayCalories(tracking);

        // ✅ RETOURNE DayTrackingDto COMPLET (pour frontend)
        return entityToDto(tracking);
    }

    /**
     * ✅ NOUVEAU : UPDATE repas existant
     */
    public DayTrackingDto updateMeal(UUID userId, LocalDate date, String mealId, DayMealDto mealDto) {
        System.out.println("🔄 Service: Updating meal " + mealId + " → " + mealDto.getRecipeName());

        // 1. Récupérer DayTracking
        DayTracking tracking = trackingRepo.findByUserIdAndDate(userId, date)
                .orElseThrow(() -> new RuntimeException("Day tracking not found"));

        // 2. Trouver le repas à updater
        DayMeal meal = mealRepo.findById(UUID.fromString(mealId))
                .orElseThrow(() -> new RuntimeException("Meal not found: " + mealId));

        // 3. Vérifier que le repas appartient au bon jour
        if (!meal.getDayTrackingId().equals(tracking.getId())) {
            throw new RuntimeException("Meal belongs to different day");
        }

        // 4. UPDATE tous les champs
        meal.setRecipeName(mealDto.getRecipeName());
        meal.setLabel(mealDto.getLabel());
        meal.setTime(mealDto.getTime());
        meal.setCalories(mealDto.getCalories());
        meal.setServings(mealDto.getServings() != null ? mealDto.getServings() : 1);
        if (mealDto.getProtein() != null) meal.setProtein(mealDto.getProtein());
        if (mealDto.getCarbs() != null) meal.setCarbs(mealDto.getCarbs());
        if (mealDto.getFat() != null) meal.setFat(mealDto.getFat());
        if (mealDto.getImageUrl() != null) meal.setImageUrl(mealDto.getImageUrl());

        // 5. Sauvegarder
        mealRepo.save(meal);
        System.out.println("✅ Meal updated: " + meal.getId());

        // 6. Recalculer calories totales
        updateDayCalories(tracking);

        // 7. Retourner DayTrackingDto complet
        return entityToDto(tracking);
    }

    /**
     * ✅ CORRIGÉ : Retourne DayTrackingDto COMPLET
     */
    public DayTrackingDto addWorkout(UUID userId, LocalDate date, DayWorkoutDto workoutDto) {
        // Récupérer ou créer le DayTracking
        DayTracking tracking = trackingRepo.findByUserIdAndDate(userId, date)
                .orElseGet(() -> {
                    DayTracking newTracking = new DayTracking(userId, date);
                    return trackingRepo.save(newTracking);
                });

        // Créer l'entraînement
        DayWorkout workout = new DayWorkout();
        workout.setDayTrackingId(tracking.getId());
        workout.setName(workoutDto.getName());
        workout.setTime(workoutDto.getTime());
        workout.setDurationMin(workoutDto.getDurationMin());
        workout.setCaloriesBurned(workoutDto.getCaloriesBurned());
        workout.setTotalSets(workoutDto.getTotalSets() != null ? workoutDto.getTotalSets() : 0);

        DayWorkout savedWorkout = workoutRepo.save(workout);
        System.out.println("✅ Workout saved: " + savedWorkout.getId());  // ✅ AJOUTE ÇA

        // Mettre à jour les stats d'entraînement
        updateDayWorkoutStats(tracking);

        // ✅ RETOURNE DayTrackingDto COMPLET (pour frontend)
        return entityToDto(tracking);
    }

    /**
     * Met à jour les calories totales du jour ✅ PROTÉGÉ null
     */
    private void updateDayCalories(DayTracking tracking) {
        List<DayMeal> meals = mealRepo.findByDayTrackingId(tracking.getId());
        int totalCalories = meals.stream()
                .mapToInt(m -> m.getCalories() != null ? m.getCalories() : 0)  // ✅ PROTÉGÉ
                .sum();
        tracking.setCaloriesIn(totalCalories);
        trackingRepo.save(tracking);
    }

    /**
     * Met à jour les stats d'entraînement du jour ✅ PROTÉGÉ null
     */
    private void updateDayWorkoutStats(DayTracking tracking) {
        List<DayWorkout> workouts = workoutRepo.findByDayTrackingId(tracking.getId());
        int totalMinutes = workouts.stream()
                .mapToInt(w -> w.getDurationMin() != null ? w.getDurationMin() : 0)
                .sum();
        int totalSets = workouts.stream()
                .mapToInt(w -> w.getTotalSets() != null ? w.getTotalSets() : 0)
                .sum();
        int totalCalories = workouts.stream()
                .mapToInt(w -> w.getCaloriesBurned() != null ? w.getCaloriesBurned() : 0)
                .sum();

        tracking.setTotalWorkoutMinutes(totalMinutes);
        tracking.setTotalSets(totalSets);
        tracking.setCaloriesOut(totalCalories);
        trackingRepo.save(tracking);
    }

    /**
     * Convertit Entity → DTO ✅ COMPLÈT
     */
    private DayTrackingDto entityToDto(DayTracking entity) {
        DayTrackingDto dto = new DayTrackingDto();
        dto.id = entity.getId();
        dto.date = entity.getDate().toString();
        dto.caloriesIn = entity.getCaloriesIn();
        dto.caloriesTarget = entity.getCaloriesTarget();
        dto.caloriesOut = entity.getCaloriesOut();
        dto.totalWorkoutMinutes = entity.getTotalWorkoutMinutes();
        dto.totalSets = entity.getTotalSets();

        // Charger les meals
        List<DayMeal> meals = mealRepo.findByDayTrackingId(entity.getId());
        dto.meals = meals.stream()
                .map(DayMealDto::fromEntity)
                .collect(Collectors.toList());

        // Charger les workouts
        List<DayWorkout> workouts = workoutRepo.findByDayTrackingId(entity.getId());
        dto.workouts = workouts.stream()
                .map(DayWorkoutDto::fromEntity)
                .collect(Collectors.toList());

        return dto;
    }
    /**
 * ✅ NOUVEAU : SUPPRIME repas
 */
public DayTrackingDto deleteMeal(UUID userId, LocalDate date, String mealId) {
    System.out.println("🗑️ Service: Deleting meal " + mealId);
    
    // 1. Récupérer DayTracking
    DayTracking tracking = trackingRepo.findByUserIdAndDate(userId, date)
            .orElseThrow(() -> new RuntimeException("Day tracking not found"));

    // 2. Supprimer repas
    DayMeal meal = mealRepo.findById(UUID.fromString(mealId))
            .orElseThrow(() -> new RuntimeException("Meal not found: " + mealId));
    
    if (!meal.getDayTrackingId().equals(tracking.getId())) {
        throw new RuntimeException("Meal belongs to different day");
    }

    mealRepo.delete(meal);
    System.out.println("✅ Meal deleted: " + mealId);

    // 3. Recalculer calories
    updateDayCalories(tracking);

    return entityToDto(tracking);
}

}
