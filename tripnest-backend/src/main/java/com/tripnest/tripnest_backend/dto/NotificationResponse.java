package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Integer userId;
    private String title;
    private String message;
    private String type;
    private Long relatedTripId;
    private boolean read;
    private LocalDateTime createdAt;
}
