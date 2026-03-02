package com.challenge.presentation.controller

import com.challenge.application.dto.NotificationCountResponse
import com.challenge.application.dto.NotificationResponse
import com.challenge.application.service.NotificationService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {

    @GetMapping
    fun getNotifications(authentication: Authentication): List<NotificationResponse> {
        val userId = UUID.fromString(authentication.principal as String)
        return notificationService.getNotifications(userId)
    }

    @GetMapping("/unread-count")
    fun getUnreadCount(authentication: Authentication): NotificationCountResponse {
        val userId = UUID.fromString(authentication.principal as String)
        return notificationService.getUnreadCount(userId)
    }

    @PutMapping("/{id}/read")
    fun markAsRead(
        @PathVariable id: UUID,
        authentication: Authentication
    ) {
        val userId = UUID.fromString(authentication.principal as String)
        notificationService.markAsRead(id, userId)
    }

    @PutMapping("/read-all")
    fun markAllAsRead(authentication: Authentication) {
        val userId = UUID.fromString(authentication.principal as String)
        notificationService.markAllAsRead(userId)
    }
}
