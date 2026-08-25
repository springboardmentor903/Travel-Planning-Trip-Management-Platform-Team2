package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.BudgetRequest;
import com.tripnest.tripnest_backend.dto.BudgetResponse;
import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.repository.BudgetRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TripRepository tripRepository;

    // =========================================================
    // CREATE — POST /api/trips/{tripId}/budget
    // =========================================================

    public BudgetResponse createBudget(Long tripId, BudgetRequest request, String email) {

        Trip trip = findTripOwnedByUser(tripId, email);

        // Business rule: each trip can only have one budget record
        if (budgetRepository.existsByTripId(tripId)) {
            throw new IllegalStateException(
                    "A budget already exists for trip #" + tripId
                    + ". Use PUT to update it."
            );
        }

        // Validation: spentAmount must not exceed totalBudget on creation
        BigDecimal spent = request.getSpentAmount() != null
                ? request.getSpentAmount()
                : BigDecimal.ZERO;

        if (spent.compareTo(request.getTotalBudget()) > 0) {
            throw new IllegalArgumentException(
                    "Spent amount (" + spent + ") cannot exceed total budget ("
                    + request.getTotalBudget() + ") on creation."
            );
        }

        Budget budget = new Budget();
        budget.setTrip(trip);
        budget.setTotalBudget(request.getTotalBudget());
        budget.setSpentAmount(spent);
        budget.setCurrency(request.getCurrency() != null ? request.getCurrency().toUpperCase() : "INR");
        budget.setNotes(request.getNotes());

        return toResponse(budgetRepository.save(budget));
    }


    // =========================================================
    // UPDATE — PUT /api/trips/{tripId}/budget
    // =========================================================

    public BudgetResponse updateBudget(Long tripId, BudgetRequest request, String email) {

        findTripOwnedByUser(tripId, email);   // ownership check

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() -> new RuntimeException(
                        "No budget found for trip #" + tripId
                        + ". Use POST to create one first."
                ));

        BigDecimal spent = request.getSpentAmount() != null
                ? request.getSpentAmount()
                : budget.getSpentAmount();   // keep existing spent if not provided

        // Validation: new spentAmount must not be negative
        if (spent.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Spent amount cannot be negative.");
        }

        // Allow updating total even when spent > new total — just flag as over-budget
        budget.setTotalBudget(request.getTotalBudget());
        budget.setSpentAmount(spent);
        if (request.getCurrency() != null) {
            budget.setCurrency(request.getCurrency().toUpperCase());
        }
        if (request.getNotes() != null) {
            budget.setNotes(request.getNotes());
        }

        return toResponse(budgetRepository.save(budget));
    }


    // =========================================================
    // GET — GET /api/trips/{tripId}/budget
    // =========================================================

    public BudgetResponse getBudget(Long tripId, String email) {

        findTripOwnedByUser(tripId, email);   // ownership check

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() -> new RuntimeException(
                        "No budget found for trip #" + tripId
                ));

        return toResponse(budget);
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private Trip findTripOwnedByUser(Long tripId, String email) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException(
                        "Trip not found with id: " + tripId
                ));

        if (!trip.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied: you do not own this trip.");
        }

        return trip;
    }

    private BudgetResponse toResponse(Budget b) {

        return new BudgetResponse(
                b.getId(),
                b.getTrip().getId(),
                b.getTrip().getTitle(),
                b.getTotalBudget(),
                b.getSpentAmount(),
                b.getRemainingBudget(),
                b.isOverBudget(),
                b.getCurrency(),
                b.getNotes(),
                b.getCreatedAt(),
                b.getUpdatedAt()
        );
    }
}
