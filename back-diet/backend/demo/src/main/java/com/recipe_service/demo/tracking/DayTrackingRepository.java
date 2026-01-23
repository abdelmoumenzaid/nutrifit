package com.recipe_service.demo.tracking;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DayTrackingRepository extends JpaRepository<DayTracking, UUID> {
    Optional<DayTracking> findByUserIdAndDate(UUID userId, LocalDate date);
}

