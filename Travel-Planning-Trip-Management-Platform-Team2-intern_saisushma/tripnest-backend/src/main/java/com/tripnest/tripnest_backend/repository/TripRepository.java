package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserEmail(String email);

    @Query("SELECT DISTINCT t FROM Trip t LEFT JOIN TripMember tm ON tm.trip = t WHERE t.user.email = :email OR tm.user.email = :email")
    List<Trip> findAllAccessibleByUserEmail(@Param("email") String email);

    List<Trip> findByTitleContainingIgnoreCase(String title);
}