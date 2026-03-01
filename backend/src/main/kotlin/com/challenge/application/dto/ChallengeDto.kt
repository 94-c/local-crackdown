package com.challenge.application.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.time.LocalDateTime

data class CreateChallengeRequest(
    @field:NotBlank
    @field:Size(max = 100)
    val title: String,

    val description: String? = null,

    @field:NotNull
    val startDate: LocalDate,

    @field:NotNull
    val endDate: LocalDate
)

data class UpdateChallengeRequest(
    @field:Size(max = 100)
    val title: String? = null,

    val description: String? = null,

    val startDate: LocalDate? = null,

    val endDate: LocalDate? = null,

    val status: String? = null
)

data class ChallengeResponse(
    val id: String,
    val title: String,
    val description: String?,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val currentWeek: Int,
    val status: String,
    val createdAt: LocalDateTime
)
