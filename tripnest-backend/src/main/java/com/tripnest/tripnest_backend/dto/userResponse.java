package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class userResponse {

    private Integer id;
    private String name;
    private String email;
    private String role;
    private String address;
    private String profilePhotoUrl;
    private LocalDateTime createdAt;
}