package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final UserRepository    userRepository;
    private final BudgetRepository  budgetRepository;
    private final TripAccessService tripAccessService;

    // ============================================================
    // CREATE  POST /api/trips/{tripId}/expenses
    // ============================================================
    @Transactional
    public ExpenseResponse createExpense(Long tripId, ExpenseRequest req, String payerEmail) {

        Trip trip = tripAccessService.checkTripAccess(tripId, payerEmail);
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
    @Transactional(readOnly = true)
    public List<ExpenseResponse> listExpenses(Long tripId, String email) {

        tripAccessService.checkTripAccess(tripId, email);

        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ============================================================
    // UPDATE  PUT /api/trips/{tripId}/expenses/{expenseId}
    // ============================================================
    @Transactional
    public ExpenseResponse updateExpense(Long tripId, Long expenseId, ExpenseRequest req, String email) {

        tripAccessService.checkTripAccess(tripId, email);

        Expense expense = findExpenseBelongingToTrip(expenseId, tripId);

        // Allow update if caller is the payer OR Group Admin / Trip Owner
        boolean isPayer = expense.getPayer().getEmail().equalsIgnoreCase(email);
        boolean isAdmin = tripAccessService.isGroupAdminOrOwner(tripId, email);

        if (!isPayer && !isAdmin) {
            throw new RuntimeException("Access denied: You can only edit your own expenses unless you are a Group Admin or Owner.");
        }

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
    @Transactional
    public void deleteExpense(Long tripId, Long expenseId, String email) {

        tripAccessService.checkTripAccess(tripId, email);

        Expense expense = findExpenseBelongingToTrip(expenseId, tripId);

        boolean isPayer = expense.getPayer().getEmail().equalsIgnoreCase(email);
        boolean isAdmin = tripAccessService.isGroupAdminOrOwner(tripId, email);

        if (!isPayer && !isAdmin) {
            throw new RuntimeException("Access denied: You can only delete your own expenses unless you are a Group Admin or Owner.");
        }

        expenseRepository.delete(expense);
    }

    // ============================================================
    // CATEGORY SUMMARY  GET /api/trips/{tripId}/expenses/summary
    // ============================================================
    @Transactional(readOnly = true)
    public List<CategorySummary> getCategorySummary(Long tripId, String email) {

        tripAccessService.checkTripAccess(tripId, email);

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
    // ============================================================
    @Transactional(readOnly = true)
    public RemainingBudgetResponse getRemainingBudget(Long tripId, String email) {

        tripAccessService.checkTripAccess(tripId, email);

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
