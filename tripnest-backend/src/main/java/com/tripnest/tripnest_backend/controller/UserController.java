package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.MessageResponse;
import com.tripnest.tripnest_backend.dto.PhotoUploadResponse;
import com.tripnest.tripnest_backend.dto.ResetPasswordRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.dto.UpdateUserRequest;
import com.tripnest.tripnest_backend.dto.userResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public userResponse getCurrentUser(
            Authentication authentication
    ) {

        String email = authentication.getName();

        return userService.getCurrentUser(email);
    }

    @PutMapping("/me")
    public userResponse updateCurrentUser(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {

        String email = authentication.getName();

        return userService.updateCurrentUser(email, request);
    }

    @PostMapping("/me/reset-password")
    public MessageResponse resetPassword(
            Authentication authentication,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        String email = authentication.getName();
        return userService.resetPassword(email, request);
    }

    @GetMapping("/me/trips")
    public List<TripResponse> getMyTrips(
            Authentication authentication
    ) {
        return userService.getMyTrips(authentication.getName());
    }

    @GetMapping("/me/favorite-destination")
    public Destination getFavoriteDestination(Authentication authentication) {
        return userService.getFavoriteDestination(authentication.getName());
    }

    @PutMapping("/me/favorite-destination/{destinationId}")
    public Destination setFavoriteDestination(
            Authentication authentication,
            @PathVariable Integer destinationId) {
        return userService.setFavoriteDestination(authentication.getName(), destinationId);
    }

    @DeleteMapping("/me/favorite-destination")
    public ResponseEntity<Void> removeFavoriteDestination(Authentication authentication) {
        userService.removeFavoriteDestination(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PhotoUploadResponse uploadProfilePhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        return userService.uploadProfilePhoto(authentication.getName(), file);
    }
}
