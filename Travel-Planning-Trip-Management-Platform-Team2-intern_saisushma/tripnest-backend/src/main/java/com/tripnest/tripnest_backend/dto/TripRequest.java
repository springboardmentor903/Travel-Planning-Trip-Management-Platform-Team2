package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TripRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private Integer destinationId;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    private Double budget;

    private String status;
}
