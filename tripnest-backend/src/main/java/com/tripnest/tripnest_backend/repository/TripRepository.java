package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByUserEmail(String email);
}
