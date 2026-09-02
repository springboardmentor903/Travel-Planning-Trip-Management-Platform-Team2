package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // All expenses for a trip, newest first
    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);

    // Sum of all expense amounts for a trip — used for remaining budget calculation
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.trip.id = :tripId")
    BigDecimal sumAmountByTripId(@Param("tripId") Long tripId);

    // Group expenses by category for a trip and return [category, totalAmount] pairs
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.trip.id = :tripId GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> sumByCategory(@Param("tripId") Long tripId);

    void deleteByTripId(Long tripId);
}
