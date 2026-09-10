package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.TripJoinRequestDto;
import com.tripnest.tripnest_backend.dto.TripJoinResponse;
import com.tripnest.tripnest_backend.dto.TripSearchResultResponse;
import com.tripnest.tripnest_backend.service.TripJoinRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripJoinRequestController {

    private final TripJoinRequestService joinRequestService;

    // GET /api/trips/search?name={name} — Search trips by name
    @GetMapping("/search")
    public List<TripSearchResultResponse> searchTrips(
            @RequestParam(name = "name", required = false, defaultValue = "") String name,
            Authentication auth) {
        String email = (auth != null) ? auth.getName() : null;
        return joinRequestService.searchTripsByName(name, email);
    }

    // POST /api/trips/{tripId}/join-requests — Request to join a trip
    @PostMapping("/{tripId}/join-requests")
    public ResponseEntity<TripJoinResponse> requestToJoin(
            @PathVariable Long tripId,
            @RequestBody(required = false) TripJoinRequestDto request,
            Authentication auth) {
        TripJoinResponse response = joinRequestService.requestToJoin(tripId, request, auth.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /api/trips/{tripId}/join-requests — List pending/all requests for a trip (Group Admin/Owner)
    @GetMapping("/{tripId}/join-requests")
    public List<TripJoinResponse> listTripJoinRequests(
            @PathVariable Long tripId,
            Authentication auth) {
        return joinRequestService.listTripJoinRequests(tripId, auth.getName());
    }

    // PUT /api/trips/{tripId}/join-requests/{requestId}/accept — Accept join request (Group Admin/Owner)
    @PutMapping("/{tripId}/join-requests/{requestId}/accept")
    public ResponseEntity<TripJoinResponse> acceptJoinRequest(
            @PathVariable Long tripId,
            @PathVariable Long requestId,
            Authentication auth) {
        TripJoinResponse response = joinRequestService.respondToJoinRequest(tripId, requestId, true, auth.getName());
        return ResponseEntity.ok(response);
    }

    // PUT /api/trips/{tripId}/join-requests/{requestId}/reject — Reject join request (Group Admin/Owner)
    @PutMapping("/{tripId}/join-requests/{requestId}/reject")
    public ResponseEntity<TripJoinResponse> rejectJoinRequest(
            @PathVariable Long tripId,
            @PathVariable Long requestId,
            Authentication auth) {
        TripJoinResponse response = joinRequestService.respondToJoinRequest(tripId, requestId, false, auth.getName());
        return ResponseEntity.ok(response);
    }

    // GET /api/trips/join-requests/my — List join requests sent by current user
    @GetMapping("/join-requests/my")
    public List<TripJoinResponse> listMyJoinRequests(Authentication auth) {
        return joinRequestService.listMyJoinRequests(auth.getName());
    }
}
