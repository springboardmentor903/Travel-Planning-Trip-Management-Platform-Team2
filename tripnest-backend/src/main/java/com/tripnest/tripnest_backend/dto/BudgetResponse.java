package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {

    private Long id;
    private Long tripId;
    private String tripTitle;

    private BigDecimal totalBudget;
    private BigDecimal spentAmount;
    private BigDecimal remainingBudget;  // computed: total - spent
    private boolean overBudget;          // computed: spent > total

    private String currency;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
