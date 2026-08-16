package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final RestTemplate restTemplate;

    @Value("${openweather.api.key}")
    private String weatherApiKey;

    @Value("${openweather.api.url}")
    private String weatherApiUrl;

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

    // GET /api/destinations/popular — returns first 5 destinations as popular
    public List<DestinationResponse> getPopular() {
        return destinationRepository.findAll().stream()
                .limit(5)
                .map(this::toResponse)
                .toList();
    }

    // GET /api/destinations/{id}/weather — live weather for destination city
    @SuppressWarnings("unchecked")
    public Map<String, Object> getWeather(Integer id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));

        String city = destination.getCity() != null ? destination.getCity() : destination.getName();
        String url = weatherApiUrl + "?q=" + city + "&appid=" + weatherApiKey + "&units=metric";

        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch weather for: " + city + ". " + e.getMessage());
        }
    }

    private DestinationResponse toResponse(Destination d) {
        return new DestinationResponse(
                d.getId(), d.getName(), d.getCountry(),
                d.getCity(), d.getDescription(), d.getImageUrl()
        );
    }
}
