package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSearchResultResponse {

    private Long id;
    private String title;
    private String description;
    private String destinationName;
    private String ownerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double budget;
    private String status;
    private LocalDateTime createdAt;
    private String userRelationship; // "OWNER", "GROUP_ADMIN", "MEMBER", "REQUEST_PENDING", "NONE"
}
