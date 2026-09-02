package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.*;
import com.tripnest.tripnest_backend.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // POST /api/trips/{tripId}/expenses
    @PostMapping
    public ResponseEntity<ExpenseResponse> create(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request,
            Authentication auth) {

        return new ResponseEntity<>(
                expenseService.createExpense(tripId, request, auth.getName()),
                HttpStatus.CREATED
        );
    }

    // GET /api/trips/{tripId}/expenses
    @GetMapping
    public List<ExpenseResponse> list(
            @PathVariable Long tripId,
            Authentication auth) {

        return expenseService.listExpenses(tripId, auth.getName());
    }

    // PUT /api/trips/{tripId}/expenses/{expenseId}
    @PutMapping("/{expenseId}")
    public ExpenseResponse update(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request,
            Authentication auth) {

        return expenseService.updateExpense(tripId, expenseId, request, auth.getName());
    }

    // DELETE /api/trips/{tripId}/expenses/{expenseId}
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            Authentication auth) {

        expenseService.deleteExpense(tripId, expenseId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // GET /api/trips/{tripId}/expenses/summary  — spending by category
    @GetMapping("/summary")
    public List<CategorySummary> summary(
            @PathVariable Long tripId,
            Authentication auth) {

        return expenseService.getCategorySummary(tripId, auth.getName());
    }

    // GET /api/trips/{tripId}/expenses/remaining  — remaining budget
    @GetMapping("/remaining")
    public RemainingBudgetResponse remaining(
            @PathVariable Long tripId,
            Authentication auth) {

        return expenseService.getRemainingBudget(tripId, auth.getName());
    }
}
