package com.tripnest.tripnest_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripnest.tripnest_backend.entity.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    List<Activity> findByItineraryIdOrderByStartTimeAsc(Integer itineraryId);

    void deleteByItineraryId(Integer itineraryId);
}
