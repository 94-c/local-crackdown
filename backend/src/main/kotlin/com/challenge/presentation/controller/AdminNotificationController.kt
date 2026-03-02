package com.challenge.presentation.controller

import com.challenge.application.dto.ReminderResult
import com.challenge.application.service.NotificationService
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/admin/notifications")
class AdminNotificationController(
    private val notificationService: NotificationService
) {

    @PostMapping("/remind")
    fun sendReminders(@RequestParam challengeId: UUID): ReminderResult {
        return notificationService.sendReminders(challengeId)
    }
}
