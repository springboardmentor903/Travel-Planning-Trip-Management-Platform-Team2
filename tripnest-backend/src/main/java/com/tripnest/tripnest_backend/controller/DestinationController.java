package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;


    // =========================
    // GET ALL DESTINATIONS
    // =========================

    @GetMapping
    public List<DestinationResponse> listAll() {

        return destinationService.listAll();
    }


    // =========================
    // GET POPULAR DESTINATIONS
    // =========================

    @GetMapping("/popular")
    public List<DestinationResponse> getPopular() {

        return destinationService.getPopular();
    }


    // =========================
    // SEARCH USING OPENSTREETMAP
    // =========================

    // Example:
    // GET /api/destinations/search?query=London

    @GetMapping("/search")
    public List<Map<String, Object>> searchDestinations(
            @RequestParam String query
    ) {

        return destinationService.searchDestinations(query);
    }


    // =========================
    // WEATHER FOR SEARCHED
    // OPENSTREETMAP LOCATION
    // =========================

    // Example:
    // GET /api/destinations/weather?lat=51.5074&lon=-0.1278

    @GetMapping("/weather")
    public Map<String, Object> getWeatherByCoordinates(
            @RequestParam double lat,
            @RequestParam double lon
    ) {

        return destinationService.getWeatherByCoordinates(
                lat,
                lon
        );
    }


    // =========================
    // GET DATABASE DESTINATION
    // =========================

    @GetMapping("/{id}")
    public DestinationResponse getById(
            @PathVariable Integer id
    ) {

        return destinationService.getById(id);
    }


    // =========================
    // WEATHER FOR DATABASE
    // DESTINATION
    // =========================

    @GetMapping("/{id}/weather")
    public Map<String, Object> getWeather(
            @PathVariable Integer id
    ) {

        return destinationService.getWeather(id);
    }
}