package com.tripnest.tripnest_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ActivityRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String type;
}
