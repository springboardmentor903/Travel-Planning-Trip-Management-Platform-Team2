package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.AddMemberRequest;
import com.tripnest.tripnest_backend.dto.TripMemberResponse;
import com.tripnest.tripnest_backend.dto.UpdateMemberRoleRequest;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.TripMember;
import com.tripnest.tripnest_backend.entity.TripMemberRole;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.TripMemberRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripMemberService {

    private final TripMemberRepository tripMemberRepository;
    private final UserRepository userRepository;
    private final TripAccessService tripAccessService;

    /**
     * Add a member to a trip by email address.
     * Restricted to Trip Owner or Group Admin.
     */
    @Transactional
    public TripMemberResponse addMember(Long tripId, AddMemberRequest req, String authEmail) {
        Trip trip = tripAccessService.checkGroupAdminOrOwnerAccess(tripId, authEmail);

        User userToAdd = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + req.getEmail()));

        // Check if user is the trip owner
        if (trip.getUser().getId().equals(userToAdd.getId())) {
            throw new IllegalArgumentException("The user is already the owner of this trip.");
        }

        // Check if user is already a member
        if (tripMemberRepository.existsByTripIdAndUserId(tripId, userToAdd.getId())) {
            throw new IllegalArgumentException("User is already a member of this trip.");
        }

        TripMemberRole role = req.getRole() != null ? req.getRole() : TripMemberRole.MEMBER;

        TripMember member = new TripMember();
        member.setTrip(trip);
        member.setUser(userToAdd);
        member.setRole(role);

        TripMember saved = tripMemberRepository.save(member);
        return toResponse(saved, false);
    }

    /**
     * List all members of a trip (including the owner).
     * Accessible by Trip Owner or any Trip Member.
     */
    @Transactional(readOnly = true)
    public List<TripMemberResponse> listMembers(Long tripId, String authEmail) {
        Trip trip = tripAccessService.checkTripAccess(tripId, authEmail);

        List<TripMemberResponse> responses = new ArrayList<>();

        // Add the owner first
        User owner = trip.getUser();
        responses.add(new TripMemberResponse(
                null,
                owner.getId(),
                owner.getName(),
                owner.getEmail(),
                "OWNER",
                owner.getProfilePhotoUrl(),
                trip.getCreatedAt(),
                true
        ));

        // Add all enrolled members
        List<TripMember> members = tripMemberRepository.findByTripIdWithUser(tripId);
        for (TripMember m : members) {
            // Avoid duplicate if owner was also in table
            if (!m.getUser().getId().equals(owner.getId())) {
                responses.add(toResponse(m, false));
            }
        }

        return responses;
    }

    /**
     * Remove a member from a trip.
     * Restricted to Trip Owner or Group Admin.
     * Regular members cannot remove anyone. Group Admins cannot remove the Owner or other Group Admins.
     */
    @Transactional
    public void removeMember(Long tripId, Long memberId, String authEmail) {
        Trip trip = tripAccessService.checkGroupAdminOrOwnerAccess(tripId, authEmail);

        TripMember member = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Trip member record not found with id: " + memberId));

        if (!member.getTrip().getId().equals(tripId)) {
            throw new RuntimeException("Member record does not belong to trip #" + tripId);
        }

        boolean isCallerOwner = tripAccessService.isOwner(trip, authEmail);

        // A group admin cannot remove another group admin or owner
        if (!isCallerOwner && member.getRole() == TripMemberRole.GROUP_ADMIN) {
            // Check if caller is removing themselves (leaving the group)
            if (!member.getUser().getEmail().equalsIgnoreCase(authEmail)) {
                throw new RuntimeException("Access denied: Only the Trip Owner can remove a Group Admin.");
            }
        }

        tripMemberRepository.delete(member);
    }

    /**
     * Change a member's role (MEMBER <-> GROUP_ADMIN).
     * Restricted to Trip Owner or Group Admin.
     */
    @Transactional
    public TripMemberResponse changeMemberRole(
            Long tripId,
            Long memberId,
            UpdateMemberRoleRequest req,
            String authEmail
    ) {
        Trip trip = tripAccessService.checkGroupAdminOrOwnerAccess(tripId, authEmail);

        TripMember member = tripMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Trip member record not found with id: " + memberId));

        if (!member.getTrip().getId().equals(tripId)) {
            throw new RuntimeException("Member record does not belong to trip #" + tripId);
        }

        boolean isCallerOwner = tripAccessService.isOwner(trip, authEmail);

        // If caller is Group Admin (not owner), they cannot modify role of another Group Admin
        if (!isCallerOwner && member.getRole() == TripMemberRole.GROUP_ADMIN) {
            throw new RuntimeException("Access denied: Only the Trip Owner can modify roles of Group Admins.");
        }

        member.setRole(req.getRole());
        TripMember saved = tripMemberRepository.save(member);
        return toResponse(saved, false);
    }

    private TripMemberResponse toResponse(TripMember tm, boolean isOwner) {
        return new TripMemberResponse(
                tm.getId(),
                tm.getUser().getId(),
                tm.getUser().getName(),
                tm.getUser().getEmail(),
                tm.getRole().name(),
                tm.getUser().getProfilePhotoUrl(),
                tm.getJoinedAt(),
                isOwner
        );
    }
}
