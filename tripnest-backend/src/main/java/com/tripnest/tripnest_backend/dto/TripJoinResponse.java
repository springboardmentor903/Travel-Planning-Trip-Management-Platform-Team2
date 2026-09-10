package com.tripnest.tripnest_backend.dto;

import com.tripnest.tripnest_backend.entity.TripJoinRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripJoinResponse {

    private Long id;
    private Long tripId;
    private String tripTitle;
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userProfilePhotoUrl;
    private TripJoinRequestStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
