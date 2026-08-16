package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.ActivityRequest;
import com.tripnest.tripnest_backend.dto.ActivityResponse;
import com.tripnest.tripnest_backend.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries/{itineraryId}/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    // POST /api/itineraries/{itineraryId}/activities — add activity to a day
    @PostMapping
    public ResponseEntity<ActivityResponse> addActivity(
            @PathVariable Integer itineraryId,
            @Valid @RequestBody ActivityRequest request) {
        ActivityResponse response = activityService.addActivity(itineraryId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // GET /api/itineraries/{itineraryId}/activities — list activities for a day
    @GetMapping
    public List<ActivityResponse> listActivities(@PathVariable Integer itineraryId) {
        return activityService.listActivities(itineraryId);
    }

    // PUT /api/itineraries/{itineraryId}/activities/{activityId} — update an activity
    @PutMapping("/{activityId}")
    public ActivityResponse updateActivity(
            @PathVariable Integer itineraryId,
            @PathVariable Integer activityId,
            @Valid @RequestBody ActivityRequest request) {
        return activityService.updateActivity(itineraryId, activityId, request);
    }

    // DELETE /api/itineraries/{itineraryId}/activities/{activityId} — delete an activity
    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Integer itineraryId,
            @PathVariable Integer activityId) {
        activityService.deleteActivity(itineraryId, activityId);
        return ResponseEntity.noContent().build();
    }
}
