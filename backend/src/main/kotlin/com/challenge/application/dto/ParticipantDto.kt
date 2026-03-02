package com.challenge.application.dto

import java.time.LocalDateTime

data class ParticipantResponse(
    val id: String,
    val userId: String,
    val nickname: String,
    val email: String,
    val status: String,
    val joinedAt: LocalDateTime,
    val hasTeam: Boolean,
    val hasInbody: Boolean,
    val hasGoals: Boolean
)

data class ParticipantStatusResponse(
    val status: String
)
