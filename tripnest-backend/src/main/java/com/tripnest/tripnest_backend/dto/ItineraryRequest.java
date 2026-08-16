package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ItineraryRequest {

    @NotNull(message = "Day date is required")
    private LocalDate dayDate;

    private String notes;
}
