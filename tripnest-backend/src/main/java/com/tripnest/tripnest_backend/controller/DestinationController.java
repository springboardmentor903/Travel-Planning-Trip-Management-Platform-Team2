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

    // GET /api/destinations — list all destinations
    @GetMapping
    public List<DestinationResponse> listAll() {
        return destinationService.listAll();
    }

    // GET /api/destinations/popular — get popular destinations
    @GetMapping("/popular")
    public List<DestinationResponse> getPopular() {
        return destinationService.getPopular();
    }

    // GET /api/destinations/{id} — get one destination by id
    @GetMapping("/{id}")
    public DestinationResponse getById(@PathVariable Integer id) {
        return destinationService.getById(id);
    }

    // GET /api/destinations/{id}/weather — live weather for destination
    @GetMapping("/{id}/weather")
    public Map<String, Object> getWeather(@PathVariable Integer id) {
        return destinationService.getWeather(id);
    }
}
