package com.tripnest.tripnest_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tripnest.tripnest_backend.entity.Budget;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Retrieve the budget record for a given trip
    Optional<Budget> findByTripId(Long tripId);

    // Check whether a budget already exists for a trip (avoids duplicate creation)
    boolean existsByTripId(Long tripId);

    void deleteByTripId(Long tripId);
}
