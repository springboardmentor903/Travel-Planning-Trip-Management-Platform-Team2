package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One trip has at most one dedicated budget record
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    // Total planned budget for the trip
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalBudget;

    // Amount already spent / allocated
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal spentAmount;

    // Free-text currency code, e.g. "INR", "USD"
    @Column(length = 10)
    private String currency;

    // Optional notes about the budget
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // Default spent to zero if caller omitted it
        if (this.spentAmount == null) {
            this.spentAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Derived helpers — never persisted
    @Transient
    public BigDecimal getRemainingBudget() {
        return totalBudget.subtract(spentAmount);
    }

    @Transient
    public boolean isOverBudget() {
        return spentAmount.compareTo(totalBudget) > 0;
    }
}
