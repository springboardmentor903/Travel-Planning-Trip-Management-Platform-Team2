package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.ItineraryRequest;
import com.tripnest.tripnest_backend.dto.ItineraryResponse;
import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;

    // POST /trips/{tripId}/itineraries — add a day to the trip
    public ItineraryResponse addDay(
            Long tripId,
            ItineraryRequest request,
            String email
    ) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with id: " + tripId
                        ));

        if (!trip.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        Itinerary itinerary = new Itinerary();
        itinerary.setTrip(trip);
        itinerary.setDayDate(request.getDayDate());
        itinerary.setNotes(request.getNotes());

        return toResponse(itineraryRepository.save(itinerary));
    }


    // GET /trips/{tripId}/itineraries — list all days in my trip
    public List<ItineraryResponse> listDays(
            Long tripId,
            String email
    ) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with id: " + tripId
                        ));

        if (!trip.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        return itineraryRepository
                .findByTripIdOrderByDayDateAsc(tripId)
                .stream()
                .map(this::toResponse)
                .toList();
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