package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Integer> {

    List<Itinerary> findByTripIdOrderByDayDateAsc(Long tripId);
}