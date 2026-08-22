package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.TripRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    // POST /api/trips — create a trip
    @PostMapping
    public ResponseEntity<TripResponse> create(
            @Valid @RequestBody TripRequest request,
            Authentication authentication) {

        TripResponse response =
                tripService.create(request, authentication.getName());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    // GET /api/trips — list my trips
    @GetMapping
    public List<TripResponse> listMyTrips(
            Authentication authentication) {

        return tripService.listMyTrips(authentication.getName());
    }


    // GET /api/trips/{id} — get one trip by id
    @GetMapping("/{id}")
    public TripResponse getById(
            @PathVariable Long id,
            Authentication authentication) {

        return tripService.getById(id, authentication.getName());
    }


    // PUT /api/trips/{id} — update a trip
    @PutMapping("/{id}")
    public TripResponse update(
            @PathVariable Long id,
            @Valid @RequestBody TripRequest request,
            Authentication authentication) {

        return tripService.update(
                id,
                request,
                authentication.getName()
        );
    }


    // DELETE /api/trips/{id} — delete a trip
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication) {

        tripService.delete(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}