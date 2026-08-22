package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.UpdateUserRequest;
import com.tripnest.tripnest_backend.dto.userResponse;
import com.tripnest.tripnest_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}