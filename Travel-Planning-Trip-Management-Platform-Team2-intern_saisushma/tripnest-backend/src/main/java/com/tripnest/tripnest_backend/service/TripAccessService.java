package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripMember;
import com.tripnest.tripnest_backend.entity.TripMemberRole;
import com.tripnest.tripnest_backend.repository.TripMemberRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TripAccessService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;

    /**
     * Central reusable check: returns the Trip if the authenticated user is
     * either the Trip Owner or an enrolled Trip Member (any role).
     * Otherwise throws RuntimeException("Access denied").
     */
    public Trip checkTripAccess(Long tripId, String userEmail) {
        Trip trip = findTripById(tripId);

        if (isOwner(trip, userEmail)) {
            return trip;
        }

        if (tripMemberRepository.existsByTripIdAndUserEmail(tripId, userEmail)) {
            return trip;
        }

        throw new RuntimeException("Access denied: You are not a member or owner of this trip.");
    }

    /**
     * Reusable admin check: returns the Trip if the authenticated user is
     * either the Trip Owner or a Group Admin of the trip.
     * Otherwise throws RuntimeException.
     */
    public Trip checkGroupAdminOrOwnerAccess(Long tripId, String userEmail) {
        Trip trip = findTripById(tripId);

        if (isOwner(trip, userEmail)) {
            return trip;
        }

        Optional<TripMember> memberOpt = tripMemberRepository.findByTripIdAndUserEmail(tripId, userEmail);
        if (memberOpt.isPresent() && memberOpt.get().getRole() == TripMemberRole.GROUP_ADMIN) {
            return trip;
        }

        throw new RuntimeException("Access denied: Group Admin or Trip Owner role required.");
    }

    /**
     * Strict check for operations only the Trip Owner can perform.
     */
    public Trip checkOwnerAccess(Long tripId, String userEmail) {
        Trip trip = findTripById(tripId);

        if (isOwner(trip, userEmail)) {
            return trip;
        }

        throw new RuntimeException("Access denied: Only the Trip Owner can perform this action.");
    }

    public boolean hasTripAccess(Long tripId, String userEmail) {
        try {
            checkTripAccess(tripId, userEmail);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isGroupAdminOrOwner(Long tripId, String userEmail) {
        try {
            checkGroupAdminOrOwnerAccess(tripId, userEmail);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isOwner(Trip trip, String userEmail) {
        return trip != null && trip.getUser() != null && trip.getUser().getEmail() != null
                && trip.getUser().getEmail().equalsIgnoreCase(userEmail);
    }

    public String getUserRelationship(Trip trip, String userEmail) {
        if (userEmail == null || trip == null) {
            return "NONE";
        }
        if (isOwner(trip, userEmail)) {
            return "OWNER";
        }
        Optional<TripMember> memberOpt = tripMemberRepository.findByTripIdAndUserEmail(trip.getId(), userEmail);
        if (memberOpt.isPresent()) {
            return memberOpt.get().getRole().name();
        }
        return "NONE";
    }

    private Trip findTripById(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));
    }
}
