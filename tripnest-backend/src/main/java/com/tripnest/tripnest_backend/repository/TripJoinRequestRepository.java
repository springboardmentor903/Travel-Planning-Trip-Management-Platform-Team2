package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.TripJoinRequest;
import com.tripnest.tripnest_backend.entity.TripJoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TripJoinRequestRepository extends JpaRepository<TripJoinRequest, Long> {

    List<TripJoinRequest> findByTripIdOrderByCreatedAtDesc(Long tripId);

    List<TripJoinRequest> findByTripIdAndStatus(Long tripId, TripJoinRequestStatus status);

    Optional<TripJoinRequest> findByTripIdAndUserEmailAndStatus(Long tripId, String email, TripJoinRequestStatus status);

    List<TripJoinRequest> findByUserEmailOrderByCreatedAtDesc(String email);

    boolean existsByTripIdAndUserEmailAndStatus(Long tripId, String email, TripJoinRequestStatus status);

    void deleteByTripId(Long tripId);

    @Query("SELECT tjr FROM TripJoinRequest tjr JOIN FETCH tjr.user u WHERE tjr.trip.id = :tripId ORDER BY tjr.createdAt DESC")
    List<TripJoinRequest> findByTripIdWithUser(@Param("tripId") Long tripId);
}
