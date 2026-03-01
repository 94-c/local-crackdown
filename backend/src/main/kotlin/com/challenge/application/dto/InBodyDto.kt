package com.challenge.application.dto

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class InBodyRecordRequest(
    @field:NotNull
    val challengeId: String,

    @field:NotNull
    @field:Positive
    val weight: BigDecimal,

    @field:NotNull
    @field:Positive
    val skeletalMuscleMass: BigDecimal,

    @field:NotNull
    @field:Positive
    val bodyFatPercentage: BigDecimal,

    @field:NotNull
    val recordDate: LocalDate
)

data class InBodyRecordResponse(
    val id: String,
    val userId: String,
    val challengeId: String,
    val weight: BigDecimal,
    val skeletalMuscleMass: BigDecimal,
    val bodyFatPercentage: BigDecimal,
    val recordDate: LocalDate,
    val createdAt: LocalDateTime
)
