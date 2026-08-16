package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.ItineraryRequest;
import com.tripnest.tripnest_backend.dto.ItineraryResponse;
import com.tripnest.tripnest_backend.service.ItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/itineraries")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    // POST /api/trips/{tripId}/itineraries — add a day to the trip
    @PostMapping
    public ResponseEntity<ItineraryResponse> addDay(
            @PathVariable Integer tripId,
            @Valid @RequestBody ItineraryRequest request,
            Authentication authentication) {
        ItineraryResponse response = itineraryService.addDay(tripId, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /api/trips/{tripId}/itineraries — list all days in my trip
    @GetMapping
    public List<ItineraryResponse> listDays(
            @PathVariable Integer tripId,
            Authentication authentication) {
        return itineraryService.listDays(tripId, authentication.getName());
    }
}
