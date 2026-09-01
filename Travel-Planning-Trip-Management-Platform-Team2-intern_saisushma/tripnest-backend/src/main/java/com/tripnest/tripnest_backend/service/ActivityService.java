package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.ActivityRequest;
import com.tripnest.tripnest_backend.dto.ActivityResponse;
import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;
    private final TripAccessService tripAccessService;

    // POST /itineraries/{itineraryId}/activities
    @Transactional
    public ActivityResponse addActivity(Integer itineraryId, ActivityRequest request, String email) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found with id: " + itineraryId));

        tripAccessService.checkTripAccess(itinerary.getTrip().getId(), email);

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
    @Transactional(readOnly = true)
    public List<ActivityResponse> listActivities(Integer itineraryId, String email) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary not found with id: " + itineraryId));

        tripAccessService.checkTripAccess(itinerary.getTrip().getId(), email);

        return activityRepository.findByItineraryIdOrderByStartTimeAsc(itineraryId)
                .stream().map(this::toResponse).toList();
    }

    // PUT /itineraries/{itineraryId}/activities/{activityId}
    @Transactional
    public ActivityResponse updateActivity(Integer itineraryId, Integer activityId, ActivityRequest request, String email) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        if (!activity.getItinerary().getId().equals(itineraryId)) {
            throw new RuntimeException("Activity does not belong to this itinerary");
        }

        tripAccessService.checkTripAccess(activity.getItinerary().getTrip().getId(), email);

        activity.setTitle(request.getTitle());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setType(request.getType());

        return toResponse(activityRepository.save(activity));
    }

    // DELETE /itineraries/{itineraryId}/activities/{activityId}
    @Transactional
    public void deleteActivity(Integer itineraryId, Integer activityId, String email) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        if (!activity.getItinerary().getId().equals(itineraryId)) {
            throw new RuntimeException("Activity does not belong to this itinerary");
        }

        tripAccessService.checkTripAccess(activity.getItinerary().getTrip().getId(), email);

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
