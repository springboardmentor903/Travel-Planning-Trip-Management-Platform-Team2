package com.tripnest.tripnest_backend.repository;

import com.tripnest.tripnest_backend.entity.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TripMemberRepository extends JpaRepository<TripMember, Long> {

    List<TripMember> findByTripId(Long tripId);

    Optional<TripMember> findByTripIdAndUserEmail(Long tripId, String email);

    Optional<TripMember> findByTripIdAndUserId(Long tripId, Integer userId);

    boolean existsByTripIdAndUserEmail(Long tripId, String email);

    boolean existsByTripIdAndUserId(Long tripId, Integer userId);

    List<TripMember> findByUserEmail(String email);

    void deleteByTripId(Long tripId);

    void deleteByTripIdAndUserId(Long tripId, Integer userId);

    @Query("SELECT tm FROM TripMember tm JOIN FETCH tm.user u WHERE tm.trip.id = :tripId")
    List<TripMember> findByTripIdWithUser(@Param("tripId") Long tripId);
}
