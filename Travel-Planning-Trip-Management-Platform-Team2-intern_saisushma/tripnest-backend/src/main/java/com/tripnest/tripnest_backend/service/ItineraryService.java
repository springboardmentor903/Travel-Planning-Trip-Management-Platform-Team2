package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.ItineraryRequest;
import com.tripnest.tripnest_backend.dto.ItineraryResponse;
import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripAccessService tripAccessService;

    // POST /trips/{tripId}/itineraries — add a day to the trip
    @Transactional
    public ItineraryResponse addDay(
            Long tripId,
            ItineraryRequest request,
            String email
    ) {
        Trip trip = tripAccessService.checkTripAccess(tripId, email);

        Itinerary itinerary = new Itinerary();
        itinerary.setTrip(trip);
        itinerary.setDayDate(request.getDayDate());
        itinerary.setNotes(request.getNotes());

        return toResponse(itineraryRepository.save(itinerary));
    }


    // GET /trips/{tripId}/itineraries — list all days in trip
    @Transactional(readOnly = true)
    public List<ItineraryResponse> listDays(
            Long tripId,
            String email
    ) {
        tripAccessService.checkTripAccess(tripId, email);

        return itineraryRepository
                .findByTripIdOrderByDayDateAsc(tripId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ItineraryResponse updateDay(Long tripId, Integer itineraryId, ItineraryRequest request, String email) {
        Trip trip = tripAccessService.checkTripAccess(tripId, email);
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new RuntimeException("Itinerary day not found"));

        if (!itinerary.getTrip().getId().equals(trip.getId())) {
            throw new RuntimeException("Itinerary day does not belong to this trip");
        }

        itinerary.setDayDate(request.getDayDate());
        itinerary.setNotes(request.getNotes());
        return toResponse(itineraryRepository.save(itinerary));
    }


    private ItineraryResponse toResponse(Itinerary i) {

        return new ItineraryResponse(
                i.getId(),
                i.getTrip().getId(),
                i.getDayDate(),
                i.getNotes()
        );
    }
}
