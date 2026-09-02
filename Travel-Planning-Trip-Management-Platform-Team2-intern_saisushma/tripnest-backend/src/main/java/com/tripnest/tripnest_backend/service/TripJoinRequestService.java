package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.TripJoinRequestDto;
import com.tripnest.tripnest_backend.dto.TripJoinResponse;
import com.tripnest.tripnest_backend.dto.TripSearchResultResponse;
import com.tripnest.tripnest_backend.entity.*;
import com.tripnest.tripnest_backend.repository.TripJoinRequestRepository;
import com.tripnest.tripnest_backend.repository.TripMemberRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripJoinRequestService {

    private final TripJoinRequestRepository joinRequestRepository;
    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final UserRepository userRepository;
    private final TripAccessService tripAccessService;

    /**
     * Search trips by title/name, annotating each trip with the calling user's status.
     */
    @Transactional(readOnly = true)
    public List<TripSearchResultResponse> searchTripsByName(String name, String authEmail) {
        String query = name != null ? name.trim() : "";
        List<Trip> trips = query.isEmpty()
                ? tripRepository.findAll()
                : tripRepository.findByTitleContainingIgnoreCase(query);

        return trips.stream().map(trip -> {
            String relationship = determineUserRelationship(trip, authEmail);
            return new TripSearchResultResponse(
                    trip.getId(),
                    trip.getTitle(),
                    trip.getDescription(),
                    trip.getDestination() != null ? trip.getDestination().getName() : null,
                    trip.getUser() != null ? trip.getUser().getName() : null,
                    trip.getStartDate(),
                    trip.getEndDate(),
                    trip.getBudget(),
                    trip.getStatus(),
                    trip.getCreatedAt(),
                    relationship
            );
        }).toList();
    }

    /**
     * Submit a join request for a trip.
     */
    @Transactional
    public TripJoinResponse requestToJoin(Long tripId, TripJoinRequestDto req, String authEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        User user = userRepository.findByEmail(authEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + authEmail));

        // Validation 1: cannot request own trip
        if (trip.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are the owner of this trip.");
        }

        // Validation 2: cannot request if already a member
        if (tripMemberRepository.existsByTripIdAndUserId(tripId, user.getId())) {
            throw new IllegalArgumentException("You are already a member of this trip.");
        }

        // Validation 3: cannot submit duplicate pending request
        if (joinRequestRepository.existsByTripIdAndUserEmailAndStatus(tripId, authEmail, TripJoinRequestStatus.PENDING)) {
            throw new IllegalStateException("A pending join request for this trip already exists.");
        }

        TripJoinRequest joinRequest = new TripJoinRequest();
        joinRequest.setTrip(trip);
        joinRequest.setUser(user);
        joinRequest.setStatus(TripJoinRequestStatus.PENDING);
        joinRequest.setMessage(req != null ? req.getMessage() : null);

        TripJoinRequest saved = joinRequestRepository.save(joinRequest);
        return toResponse(saved);
    }

    /**
     * List all join requests for a trip.
     * Restricted to Trip Owner or Group Admin.
     */
    @Transactional(readOnly = true)
    public List<TripJoinResponse> listTripJoinRequests(Long tripId, String authEmail) {
        tripAccessService.checkGroupAdminOrOwnerAccess(tripId, authEmail);

        return joinRequestRepository.findByTripIdWithUser(tripId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Respond to (Accept or Reject) a join request.
     * Restricted to Trip Owner or Group Admin.
     */
    @Transactional
    public TripJoinResponse respondToJoinRequest(Long tripId, Long requestId, boolean accept, String authEmail) {
        Trip trip = tripAccessService.checkGroupAdminOrOwnerAccess(tripId, authEmail);

        TripJoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Join request not found with id: " + requestId));

        if (!request.getTrip().getId().equals(tripId)) {
            throw new RuntimeException("Join request does not belong to trip #" + tripId);
        }

        if (request.getStatus() != TripJoinRequestStatus.PENDING) {
            throw new IllegalStateException("Join request has already been " + request.getStatus().name().toLowerCase());
        }

        request.setRespondedAt(LocalDateTime.now());

        if (accept) {
            request.setStatus(TripJoinRequestStatus.ACCEPTED);

            // Automatically add as a trip member if not already added
            if (!tripMemberRepository.existsByTripIdAndUserId(tripId, request.getUser().getId())) {
                TripMember member = new TripMember();
                member.setTrip(trip);
                member.setUser(request.getUser());
                member.setRole(TripMemberRole.MEMBER);
                tripMemberRepository.save(member);
            }
        } else {
            request.setStatus(TripJoinRequestStatus.REJECTED);
        }

        TripJoinRequest saved = joinRequestRepository.save(request);
        return toResponse(saved);
    }

    /**
     * List join requests submitted by the calling user.
     */
    @Transactional(readOnly = true)
    public List<TripJoinResponse> listMyJoinRequests(String authEmail) {
        return joinRequestRepository.findByUserEmailOrderByCreatedAtDesc(authEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String determineUserRelationship(Trip trip, String authEmail) {
        if (authEmail == null) return "NONE";
        if (tripAccessService.isOwner(trip, authEmail)) {
            return "OWNER";
        }
        var memberOpt = tripMemberRepository.findByTripIdAndUserEmail(trip.getId(), authEmail);
        if (memberOpt.isPresent()) {
            return memberOpt.get().getRole().name();
        }
        if (joinRequestRepository.existsByTripIdAndUserEmailAndStatus(trip.getId(), authEmail, TripJoinRequestStatus.PENDING)) {
            return "REQUEST_PENDING";
        }
        return "NONE";
    }

    private TripJoinResponse toResponse(TripJoinRequest req) {
        return new TripJoinResponse(
                req.getId(),
                req.getTrip().getId(),
                req.getTrip().getTitle(),
                req.getUser().getId(),
                req.getUser().getName(),
                req.getUser().getEmail(),
                req.getUser().getProfilePhotoUrl(),
                req.getStatus(),
                req.getMessage(),
                req.getCreatedAt(),
                req.getRespondedAt()
        );
    }
}
