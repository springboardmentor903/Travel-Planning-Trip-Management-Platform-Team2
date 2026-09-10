package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripMemberResponse {

    private Long id; // TripMember id (or null if representing owner without a member row)
    private Integer userId;
    private String name;
    private String email;
    private String role; // "OWNER", "GROUP_ADMIN", "MEMBER"
    private String profilePhotoUrl;
    private LocalDateTime joinedAt;
    private boolean isOwner;
}
