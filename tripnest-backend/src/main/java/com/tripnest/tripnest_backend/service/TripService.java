package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.TripRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

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

        return toResponse(tripRepository.save(trip));
    }


    public List<TripResponse> listMyTrips(String email) {

        return tripRepository.findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    public TripResponse getById(Long id, String email) {

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with id: " + id
                        ));

        if (!trip.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        return toResponse(trip);
    }


    public TripResponse update(
            Long id,
            TripRequest request,
            String email
    ) {

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with id: " + id
                        ));

        if (!trip.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

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


    public void delete(Long id, String email) {

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with id: " + id
                        ));

        if (!trip.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

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