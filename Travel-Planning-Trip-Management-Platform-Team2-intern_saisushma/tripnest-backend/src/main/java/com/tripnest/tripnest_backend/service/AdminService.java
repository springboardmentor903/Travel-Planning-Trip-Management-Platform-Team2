package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AdminStatsResponse;
import com.tripnest.tripnest_backend.dto.UserSummaryResponse;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DestinationRepository destinationRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;

    public List<UserSummaryResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserSummaryResponse(u.getId(), u.getName(), u.getEmail(),
                        u.getRole() != null ? u.getRole().getName() : "TRAVELER"))
                .toList();
    }

    public UserSummaryResponse updateUserRole(Integer userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Role newRole = roleRepository.findByName(roleName.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Role does not exist: " + roleName));
        user.setRole(newRole);
        User savedUser = userRepository.save(user);
        return new UserSummaryResponse(savedUser.getId(), savedUser.getName(),
                savedUser.getEmail(), savedUser.getRole().getName());
    }

    public AdminStatsResponse getAdminStats() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        long totalDestinations = destinationRepository.count();
        long totalExpenses = expenseRepository.count();

        double totalSpent = expenseRepository.findAll().stream()
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount().doubleValue() : 0.0)
                .sum();

        Map<String, Long> usersByRole = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole() != null ? u.getRole().getName() : "TRAVELER",
                        Collectors.counting()
                ));

        return new AdminStatsResponse(
                totalUsers,
                totalTrips,
                totalDestinations,
                totalExpenses,
                totalSpent,
                usersByRole
        );
    }
}