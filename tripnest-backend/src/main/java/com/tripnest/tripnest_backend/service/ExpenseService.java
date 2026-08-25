package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private static final Set<String> VALID_CATEGORIES = Set.of(
            "TRANSPORTATION", "HOTEL", "FOOD", "SHOPPING", "ENTERTAINMENT", "MISCELLANEOUS"
    );

    private final ExpenseRepository expenseRepository;
    private final TripRepository    tripRepository;
    private final UserRepository    userRepository;
    private final BudgetRepository  budgetRepository;

    // ============================================================
    // CREATE  POST /api/trips/{tripId}/expenses
    // ============================================================
    public ExpenseResponse createExpense(Long tripId, ExpenseRequest req, String payerEmail) {

        Trip trip = findTripOwnedByUser(tripId, payerEmail);
        User payer = findUser(payerEmail);

        validateCategory(req.getCategory());
        validateAmount(req.getAmount());

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setPayer(payer);
        expense.setCategory(req.getCategory().toUpperCase());
        expense.setAmount(req.getAmount());
        expense.setExpenseDate(req.getExpenseDate());
        expense.setDescription(req.getDescription());
        expense.setReceiptUrl(req.getReceiptUrl());

        // Link to budget if one exists for this trip
        budgetRepository.findByTripId(tripId).ifPresent(expense::setBudget);

        return toResponse(expenseRepository.save(expense));
    }

    // ============================================================
    // LIST  GET /api/trips/{tripId}/expenses
    // ============================================================
    public List<ExpenseResponse> listExpenses(Long tripId, String email) {

        findTripOwnedByUser(tripId, email);   // ownership check

        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ============================================================
    // UPDATE  PUT /api/trips/{tripId}/expenses/{expenseId}
    // ============================================================
    public ExpenseResponse updateExpense(Long tripId, Long expenseId, ExpenseRequest req, String email) {

        findTripOwnedByUser(tripId, email);

        Expense expense = findExpenseBelongingToTrip(expenseId, tripId);

        validateCategory(req.getCategory());
        validateAmount(req.getAmount());

        expense.setCategory(req.getCategory().toUpperCase());
        expense.setAmount(req.getAmount());
        expense.setExpenseDate(req.getExpenseDate());
        expense.setDescription(req.getDescription());
        expense.setReceiptUrl(req.getReceiptUrl());

        return toResponse(expenseRepository.save(expense));
    }

    // ============================================================
    // DELETE  DELETE /api/trips/{tripId}/expenses/{expenseId}
    // ============================================================
    public void deleteExpense(Long tripId, Long expenseId, String email) {

        findTripOwnedByUser(tripId, email);

        Expense expense = findExpenseBelongingToTrip(expenseId, tripId);

        expenseRepository.delete(expense);
    }

    // ============================================================
    // CATEGORY SUMMARY  GET /api/trips/{tripId}/expenses/summary
    // ============================================================
    public List<CategorySummary> getCategorySummary(Long tripId, String email) {

        findTripOwnedByUser(tripId, email);

        return expenseRepository.sumByCategory(tripId)
                .stream()
                .map(row -> new CategorySummary(
                        (String) row[0],
                        (BigDecimal) row[1]
                ))
                .toList();
    }

    // ============================================================
    // REMAINING BUDGET  GET /api/trips/{tripId}/expenses/remaining
    // Remaining = totalBudget (from Budget entity) - sum(expenses)
    // ============================================================
    public RemainingBudgetResponse getRemainingBudget(Long tripId, String email) {

        findTripOwnedByUser(tripId, email);

        Budget budget = budgetRepository.findByTripId(tripId)
                .orElseThrow(() -> new RuntimeException(
                        "No budget set for trip #" + tripId + ". Create a budget first."
                ));

        BigDecimal totalExpenses = expenseRepository.sumAmountByTripId(tripId);
        BigDecimal remaining     = budget.getTotalBudget().subtract(totalExpenses);

        return new RemainingBudgetResponse(
                tripId,
                budget.getTotalBudget(),
                totalExpenses,
                remaining,
                budget.getCurrency(),
                totalExpenses.compareTo(budget.getTotalBudget()) > 0
        );
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    private Trip findTripOwnedByUser(Long tripId, String email) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + tripId));
        if (!trip.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied: you do not own this trip.");
        }
        return trip;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private Expense findExpenseBelongingToTrip(Long expenseId, Long tripId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found: " + expenseId));
        if (!expense.getTrip().getId().equals(tripId)) {
            throw new RuntimeException("Expense does not belong to trip #" + tripId);
        }
        return expense;
    }

    private void validateCategory(String category) {
        if (category == null || !VALID_CATEGORIES.contains(category.toUpperCase())) {
            throw new IllegalArgumentException(
                    "Invalid category '" + category + "'. Must be one of: " + VALID_CATEGORIES
            );
        }
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Expense amount must be greater than zero.");
        }
    }

    private ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getTrip().getId(),
                e.getCategory(),
                e.getAmount(),
                e.getExpenseDate(),
                e.getDescription(),
                e.getReceiptUrl(),
                e.getPayer().getName(),
                e.getPayer().getEmail(),
                e.getCreatedAt()
        );
    }
}
