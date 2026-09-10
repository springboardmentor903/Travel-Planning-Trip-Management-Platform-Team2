package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {

    private Long id;
    private String title;
    private String destinationName;
    private String ownerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private Double budget;
    private String status;
    private LocalDateTime createdAt;
}