package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.AddMemberRequest;
import com.tripnest.tripnest_backend.dto.TripMemberResponse;
import com.tripnest.tripnest_backend.dto.UpdateMemberRoleRequest;
import com.tripnest.tripnest_backend.service.TripMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/members")
@RequiredArgsConstructor
public class TripMemberController {

    private final TripMemberService tripMemberService;

    // POST /api/trips/{tripId}/members — Add a member by email (Owner/Group Admin)
    @PostMapping
    public ResponseEntity<TripMemberResponse> addMember(
            @PathVariable Long tripId,
            @Valid @RequestBody AddMemberRequest request,
            Authentication auth) {
        TripMemberResponse response = tripMemberService.addMember(tripId, request, auth.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /api/trips/{tripId}/members — List all members of a trip
    @GetMapping
    public List<TripMemberResponse> listMembers(
            @PathVariable Long tripId,
            Authentication auth) {
        return tripMemberService.listMembers(tripId, auth.getName());
    }

    // DELETE /api/trips/{tripId}/members/{memberId} — Remove a member (Owner/Group Admin)
    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long tripId,
            @PathVariable Long memberId,
            Authentication auth) {
        tripMemberService.removeMember(tripId, memberId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    // PUT /api/trips/{tripId}/members/{memberId}/role — Change member role (Owner/Group Admin)
    @PutMapping("/{memberId}/role")
    public ResponseEntity<TripMemberResponse> changeMemberRole(
            @PathVariable Long tripId,
            @PathVariable Long memberId,
            @Valid @RequestBody UpdateMemberRoleRequest request,
            Authentication auth) {
        TripMemberResponse response = tripMemberService.changeMemberRole(tripId, memberId, request, auth.getName());
        return ResponseEntity.ok(response);
    }
}
