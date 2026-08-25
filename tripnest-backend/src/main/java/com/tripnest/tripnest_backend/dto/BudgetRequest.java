package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull(message = "Total budget is required")
    @DecimalMin(value = "0.00", message = "Total budget must be zero or greater")
    private BigDecimal totalBudget;

    // Defaults to zero in the service if omitted
    @DecimalMin(value = "0.00", message = "Spent amount must be zero or greater")
    private BigDecimal spentAmount;

    // e.g. "INR", "USD", "EUR"
    private String currency;

    private String notes;
}
