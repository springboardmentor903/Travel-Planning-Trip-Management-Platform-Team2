package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "trip_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"trip_id", "user_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TripMemberRole role = TripMemberRole.MEMBER;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if (this.joinedAt == null) {
            this.joinedAt = LocalDateTime.now();
        }
    }
}
