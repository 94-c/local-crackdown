package com.challenge.application.dto

import java.time.LocalDateTime

data class FeedEventResponse(
    val id: String,
    val userId: String,
    val userNickname: String,
    val userProfileImageUrl: String?,
    val eventType: String,
    val referenceId: String,
    val title: String,
    val description: String?,
    val imageUrl: String?,
    val cheerCount: Long,
    val cheeredByMe: Boolean,
    val createdAt: LocalDateTime
)

data class FeedPageResponse(
    val content: List<FeedEventResponse>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val hasNext: Boolean
)

data class CheerToggleResponse(
    val cheered: Boolean,
    val cheerCount: Long
)
