package com.challenge.application.dto

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class MissionTemplateResponse(
    val id: String,
    val name: String,
    val description: String?,
    val unit: String
)

data class CreateTeamMissionRequest(
    @field:NotNull
    val teamId: String,

    @field:NotNull
    val challengeId: String,

    @field:NotNull
    @field:Positive
    val weekNumber: Int,

    @field:NotNull
    val missionTemplateId: String,

    @field:NotNull
    @field:Positive
    val targetValue: BigDecimal
)

data class TeamMissionResponse(
    val id: String,
    val teamName: String,
    val weekNumber: Int,
    val missionTemplateName: String,
    val unit: String,
    val targetValue: BigDecimal,
    val currentValue: BigDecimal,
    val status: String,
    val verifications: List<VerificationResponse>
)

data class CreateVerificationRequest(
    @field:NotNull
    val teamMissionId: String,

    val memo: String? = null,

    val imageUrl: String? = null
)

data class VerificationResponse(
    val id: String,
    val userNickname: String,
    val imageUrl: String?,
    val memo: String?,
    val verified: Boolean,
    val createdAt: LocalDateTime
)

data class UpdateMissionProgressRequest(
    @field:NotNull
    @field:Positive
    val currentValue: BigDecimal
)
