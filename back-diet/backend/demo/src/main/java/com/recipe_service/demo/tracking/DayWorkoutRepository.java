package com.recipe_service.demo.tracking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DayWorkoutRepository extends JpaRepository<DayWorkout, UUID> {
    List<DayWorkout> findByDayTrackingId(UUID dayTrackingId);
}
