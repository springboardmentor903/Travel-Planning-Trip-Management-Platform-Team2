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

    @GetMapping
    public List<DestinationResponse> listAll() {
        return destinationService.listAll();
    }

    @GetMapping("/popular")
    public List<DestinationResponse> getPopular() {
        return destinationService.getPopular();
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchDestinations(
            @RequestParam String query
    ) {
        return destinationService.searchDestinations(query);
    }

    @PostMapping("/from-search")
    public DestinationResponse saveFromSearch(
            @RequestBody Map<String, Object> data
    ) {
        return destinationService.saveFromSearch(data);
    }

    @GetMapping("/weather")
    public Map<String, Object> getWeatherByCoordinates(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        return destinationService.getWeatherByCoordinates(lat, lon);
    }

    @GetMapping("/{id}")
    public DestinationResponse getById(
            @PathVariable Integer id
    ) {
        return destinationService.getById(id);
    }

    @GetMapping("/{id}/weather")
    public Map<String, Object> getWeather(
            @PathVariable Integer id
    ) {
        return destinationService.getWeather(id);
    }
}