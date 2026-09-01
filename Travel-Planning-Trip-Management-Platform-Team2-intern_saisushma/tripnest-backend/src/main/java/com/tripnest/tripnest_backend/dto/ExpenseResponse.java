package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long tripId;
    private String category;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String description;
    private String receiptUrl;
    private String payerName;
    private String payerEmail;
    private LocalDateTime createdAt;
}
