package com.tripnest.tripnest_backend.service;
import com.tripnest.tripnest_backend.dto.userResponse;
import com.tripnest.tripnest_backend.dto.AuthResponse;
import com.tripnest.tripnest_backend.dto.LoginRequest;
import com.tripnest.tripnest_backend.dto.MessageResponse;
import com.tripnest.tripnest_backend.dto.PhotoUploadResponse;
import com.tripnest.tripnest_backend.dto.RegisterRequest;
import com.tripnest.tripnest_backend.dto.ResetPasswordRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import com.tripnest.tripnest_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.tripnest.tripnest_backend.dto.UpdateUserRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DestinationRepository destinationRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.photo-base-url:http://localhost:8081/uploads}")
    private String photoBaseUrl;

    private static final String DEFAULT_ROLE = "TRAVELER";
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered: "+ request.getEmail());
        }
        Role defaultRole = roleRepository.findByName(DEFAULT_ROLE)

                .orElseThrow(() -> new RuntimeException(
                        "Default role not found. Make sure roles are seeded"));
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(defaultRole);
        user.setOauthGoogle(false);
        User savedUser = userRepository.save(user);
        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole() != null ? savedUser.getRole().getName() : "TRAVELER",
                "User registered successfully",
                null
        );
    }
    public AuthResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->new RuntimeException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName() : "TRAVELER",
                "Login successful",
                token
        );
    }
    public userResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return toUserResponse(user);
    }
    public userResponse updateCurrentUser(
            String currentEmail,
            UpdateUserRequest request
    ) {

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getProfilePhotoUrl() != null) {
            user.setProfilePhotoUrl(request.getProfilePhotoUrl());
        }

        User updatedUser = userRepository.save(user);
        return toUserResponse(updatedUser);
    }

    public MessageResponse resetPassword(
            String email,
            ResetPasswordRequest request
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Password reset successfully");
    }

    public List<TripResponse> getMyTrips(String email) {

        return tripRepository.findByUserEmail(email)
                .stream()
                .map(this::toTripResponse)
                .toList();
    }

    public Destination getFavoriteDestination(String email) {
        return getUser(email).getFavoriteDestination();
    }

    public Destination setFavoriteDestination(String email, Integer destinationId) {
        User user = getUser(email);
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        user.setFavoriteDestination(destination);
        userRepository.save(user);
        return destination;
    }

    public void removeFavoriteDestination(String email) {
        User user = getUser(email);
        user.setFavoriteDestination(null);
        userRepository.save(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public PhotoUploadResponse uploadProfilePhoto(
            String email,
            MultipartFile file
    ) {

        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        try {

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = photoBaseUrl + "/" + fileName;
            user.setProfilePhotoUrl(photoUrl);
            userRepository.save(user);

            return new PhotoUploadResponse(photoUrl, "Profile photo uploaded successfully");
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store photo: " + ex.getMessage());
        }
    }

    private userResponse toUserResponse(User u) {
        return new userResponse(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getRole() != null ? u.getRole().getName() : "TRAVELER",
                u.getAddress(),
                u.getProfilePhotoUrl(),
                u.getCreatedAt()
        );
    }

    private TripResponse toTripResponse(Trip t) {
        return new TripResponse(
                t.getId(),
                t.getTitle(),
                t.getDestination() != null ? t.getDestination().getName() : null,
                t.getUser().getName(),
                t.getStartDate(),
                t.getEndDate(),
                t.getDescription(),
                t.getBudget(),
                t.getStatus(),
                t.getCreatedAt()
        );
    }
}
