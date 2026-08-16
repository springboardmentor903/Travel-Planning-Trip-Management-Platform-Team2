package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findByItineraryIdOrderByStartTimeAsc(Integer itineraryId);
}
