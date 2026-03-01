package com.challenge.application.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.time.LocalDateTime

data class AssignPenaltyRequest(
    @field:NotNull
    val challengeId: String,

    @field:NotNull
    val teamId: String,

    @field:NotNull
    @field:Positive
    val weekNumber: Int,

    @field:NotBlank
    val missionName: String,

    val description: String? = null
)

data class PenaltyMissionResponse(
    val id: String,
    val teamName: String,
    val weekNumber: Int,
    val missionName: String,
    val description: String?,
    val status: String,
    val verifications: List<PenaltyVerificationResponse>
)

data class PenaltyVerificationResponse(
    val id: String,
    val userNickname: String,
    val memo: String?,
    val imageUrl: String?,
    val approved: Boolean,
    val createdAt: LocalDateTime
)

data class CreatePenaltyVerificationRequest(
    @field:NotNull
    val penaltyMissionId: String,

    val memo: String? = null
)

data class UpdatePenaltyStatusRequest(
    @field:NotBlank
    val status: String
)
