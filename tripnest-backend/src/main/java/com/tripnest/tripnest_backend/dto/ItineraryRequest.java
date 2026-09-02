package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryRequest {

    @NotNull(message = "Day date is required")
    private LocalDate dayDate;

    private String notes;
}
