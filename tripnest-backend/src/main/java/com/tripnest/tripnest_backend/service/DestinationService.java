package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public List<DestinationResponse> listAll() {
        return destinationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public DestinationResponse getById(Integer id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));
        return toResponse(destination);
    }

    private DestinationResponse toResponse(Destination d) {
        return new DestinationResponse(
                d.getId(), d.getName(), d.getCountry(),
                d.getCity(), d.getDescription(), d.getImageUrl()
        );
    }
}
