package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.dto.NotificationResponse;
import com.tripnest.tripnest_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications — list current user's notifications (most recent first)
    @GetMapping
    public List<NotificationResponse> getMyNotifications(Authentication auth) {
        return notificationService.getUserNotifications(auth.getName());
    }

    // GET /api/notifications/unread-count — get count of unread notifications
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication auth) {
        long count = notificationService.getUnreadCount(auth.getName());
        return Map.of("unreadCount", count);
    }

    // PUT /api/notifications/{id}/read — mark a single notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id, Authentication auth) {
        NotificationResponse response = notificationService.markAsRead(id, auth.getName());
        return ResponseEntity.ok(response);
    }

    // PUT /api/notifications/read-all — mark all notifications as read
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.noContent().build();
    }
}
