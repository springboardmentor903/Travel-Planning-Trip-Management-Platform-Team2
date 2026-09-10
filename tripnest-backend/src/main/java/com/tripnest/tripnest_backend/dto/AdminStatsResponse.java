package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalTrips;
    private long totalDestinations;
    private long totalExpenses;
    private double totalSpentAmount;
    private Map<String, Long> usersByRole;
}
