package com.challenge.application.dto

import java.time.LocalDateTime

data class NotificationResponse(
    val id: String,
    val title: String,
    val message: String,
    val type: String,
    val isRead: Boolean,
    val link: String?,
    val createdAt: LocalDateTime
)

data class NotificationCountResponse(
    val unreadCount: Long
)
