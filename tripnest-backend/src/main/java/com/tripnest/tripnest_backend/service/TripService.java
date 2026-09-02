package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.TripRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;
    private final TripMemberRepository tripMemberRepository;
    private final TripJoinRequestRepository joinRequestRepository;
    private final TripAccessService tripAccessService;

    @Transactional
    public TripResponse create(TripRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trip trip = new Trip();

        trip.setTitle(request.getTitle());
        trip.setUser(user);
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setDescription(request.getDescription());
        trip.setBudget(request.getBudget());
        trip.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : "PLANNED"
        );

        if (request.getDestinationId() != null) {

            Destination dest = destinationRepository
                    .findById(request.getDestinationId())
                    .orElseThrow(() ->
                            new RuntimeException("Destination not found"));

            trip.setDestination(dest);
        }

        Trip savedTrip = tripRepository.save(trip);
        return toResponse(savedTrip);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> listMyTrips(String email) {
        return tripRepository.findAllAccessibleByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TripResponse getById(Long id, String email) {
        Trip trip = tripAccessService.checkTripAccess(id, email);
        return toResponse(trip);
    }

    @Transactional
    public TripResponse update(
            Long id,
            TripRequest request,
            String email
    ) {
        Trip trip = tripAccessService.checkGroupAdminOrOwnerAccess(id, email);

        trip.setTitle(request.getTitle());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setDescription(request.getDescription());
        trip.setBudget(request.getBudget());

        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }

        if (request.getDestinationId() != null) {
            Destination dest = destinationRepository
                    .findById(request.getDestinationId())
                    .orElseThrow(() ->
                            new RuntimeException("Destination not found"));

            trip.setDestination(dest);
        }

        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public void delete(Long id, String email) {
        Trip trip = tripAccessService.checkGroupAdminOrOwnerAccess(id, email);

        // Delete all related records
        joinRequestRepository.deleteByTripId(id);
        tripMemberRepository.deleteByTripId(id);
        expenseRepository.deleteByTripId(id);
        budgetRepository.deleteByTripId(id);

        List<Itinerary> itineraries = itineraryRepository.findByTripIdOrderByDayDateAsc(id);
        for (Itinerary itinerary : itineraries) {
            activityRepository.deleteByItineraryId(itinerary.getId());
        }
        itineraryRepository.deleteByTripId(id);

        tripRepository.delete(trip);
    }

    private TripResponse toResponse(Trip t) {
        return new TripResponse(
                t.getId(),
                t.getTitle(),
                t.getDestination() != null
                        ? t.getDestination().getName()
                        : null,
                t.getUser().getName(),
                t.getStartDate(),
                t.getEndDate(),
                t.getDescription(),
                t.getBudget(),
                t.getStatus(),
                t.getCreatedAt()
        );
    }
}