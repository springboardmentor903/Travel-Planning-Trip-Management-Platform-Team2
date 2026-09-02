package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "destinations")
@Data
@NoArgsConstructor
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column
    private String country;

    @Column
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    // Constructor used by DataSeeder
    public Destination(
            Integer id,
            String name,
            String country,
            String city,
            String description,
            String imageUrl
    ) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    // Constructor with coordinates
    public Destination(
            Integer id,
            String name,
            String country,
            String city,
            String description,
            String imageUrl,
            Double latitude,
            Double longitude
    ) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.city = city;
        this.description = description;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}