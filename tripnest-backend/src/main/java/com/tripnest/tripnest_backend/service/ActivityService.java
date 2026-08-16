package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.ActivityRequest;
import com.tripnest.tripnest_backend.dto.ActivityResponse;
import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;

    // POST /itineraries/{itineraryId}/activities
    public ActivityResponse addActivity(Integer itineraryId, ActivityRequest request) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found with id: " + itineraryId));

        Activity activity = new Activity();
        activity.setItinerary(itinerary);
        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setType(request.getType());

        return toResponse(activityRepository.save(activity));
    }

    // GET /itineraries/{itineraryId}/activities
    public List<ActivityResponse> listActivities(Integer itineraryId) {
        return activityRepository.findByItineraryIdOrderByStartTimeAsc(itineraryId)
                .stream().map(this::toResponse).toList();
    }

    // PUT /itineraries/{itineraryId}/activities/{activityId}
    public ActivityResponse updateActivity(Integer itineraryId, Integer activityId, ActivityRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        if (!activity.getItinerary().getId().equals(itineraryId)) {
            throw new RuntimeException("Activity does not belong to this itinerary");
        }

        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setType(request.getType());

        return toResponse(activityRepository.save(activity));
    }

    // DELETE /itineraries/{itineraryId}/activities/{activityId}
    public void deleteActivity(Integer itineraryId, Integer activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        if (!activity.getItinerary().getId().equals(itineraryId)) {
            throw new RuntimeException("Activity does not belong to this itinerary");
        }
        activityRepository.delete(activity);
    }

    private ActivityResponse toResponse(Activity a) {
        return new ActivityResponse(
                a.getId(), a.getItinerary().getId(),
                a.getTitle(), a.getDescription(),
                a.getStartTime(), a.getEndTime(),
                a.getLocation(), a.getType()
        );
    }
}
