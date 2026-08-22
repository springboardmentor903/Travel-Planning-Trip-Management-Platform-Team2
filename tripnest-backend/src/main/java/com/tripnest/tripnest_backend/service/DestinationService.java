package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;
    private final RestTemplate restTemplate;

    // =========================
    // OPENWEATHER CONFIGURATION
    // =========================

    @Value("${openweather.api.key}")
    private String weatherApiKey;

    @Value("${openweather.api.url}")
    private String weatherApiUrl;

    // =========================
    // OPENSTREETMAP / NOMINATIM
    // =========================

    @Value("${nominatim.api.url}")
    private String nominatimApiUrl;


    // =========================
    // GET ALL DESTINATIONS
    // =========================

    public List<DestinationResponse> listAll() {

        return destinationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =========================
    // GET DESTINATION BY ID
    // =========================

    public DestinationResponse getById(Integer id) {

        Destination destination =
                destinationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Destination not found with id: " + id
                                )
                        );

        return toResponse(destination);
    }


    // =========================
    // GET POPULAR DESTINATIONS
    // =========================

    public List<DestinationResponse> getPopular() {

        return destinationRepository.findAll()
                .stream()
                .limit(5)
                .map(this::toResponse)
                .toList();
    }


    // =========================
    // WEATHER FOR DATABASE DESTINATION
    // =========================

    @SuppressWarnings("unchecked")
    public Map<String, Object> getWeather(Integer id) {

        Destination destination =
                destinationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Destination not found with id: " + id
                                )
                        );

        String city =
                destination.getCity() != null
                        ? destination.getCity()
                        : destination.getName();

        String url = UriComponentsBuilder
                .fromUriString(weatherApiUrl)
                .queryParam("q", city)
                .queryParam("appid", weatherApiKey)
                .queryParam("units", "metric")
                .toUriString();

        try {

            return restTemplate.getForObject(
                    url,
                    Map.class
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not fetch weather for: "
                            + city
                            + ". "
                            + e.getMessage()
            );
        }
    }


    // =========================
    // WEATHER FOR OPENSTREETMAP
    // SEARCH RESULT
    // =========================

    @SuppressWarnings("unchecked")
    public Map<String, Object> getWeatherByCoordinates(
            double lat,
            double lon
    ) {

        String url = UriComponentsBuilder
                .fromUriString(weatherApiUrl)
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", weatherApiKey)
                .queryParam("units", "metric")
                .toUriString();

        try {

            return restTemplate.getForObject(
                    url,
                    Map.class
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not fetch weather for coordinates: "
                            + lat
                            + ", "
                            + lon
                            + ". "
                            + e.getMessage()
            );
        }
    }


    // =========================
    // OPENSTREETMAP / NOMINATIM SEARCH
    // =========================

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> searchDestinations(
            String query
    ) {

        String url = UriComponentsBuilder
                .fromUriString(nominatimApiUrl)
                .queryParam("q", query)
                .queryParam("format", "json")
                .queryParam("limit", 5)
                .queryParam("addressdetails", 1)
                .toUriString();

        try {

            HttpHeaders headers = new HttpHeaders();

            // Required by Nominatim
            headers.set(
                    "User-Agent",
                    "TripNest Student Project"
            );

            HttpEntity<Void> entity =
                    new HttpEntity<>(headers);

            ResponseEntity<List> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            entity,
                            List.class
                    );

            return response.getBody();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not search destinations: "
                            + e.getMessage()
            );
        }
    }


    // =========================
    // ENTITY → RESPONSE DTO
    // =========================

    private DestinationResponse toResponse(
            Destination d
    ) {

        return new DestinationResponse(
                d.getId(),
                d.getName(),
                d.getCountry(),
                d.getCity(),
                d.getDescription(),
                d.getImageUrl()
        );
    }
}