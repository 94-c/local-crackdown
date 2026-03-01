package com.challenge.application.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDateTime

data class UserGoalRequest(
    @field:NotNull
    val challengeId: String,

    @field:NotEmpty
    @field:Valid
    val goals: List<GoalItem>
)

data class GoalItem(
    @field:NotNull
    val goalTypeId: String,

    @field:NotNull
    @field:Positive
    val targetValue: BigDecimal,

    @field:NotNull
    @field:Positive
    val startValue: BigDecimal
)

data class UserGoalResponse(
    val id: String,
    val userId: String,
    val challengeId: String,
    val goalTypeId: String,
    val goalTypeName: String,
    val targetValue: BigDecimal,
    val startValue: BigDecimal,
    val createdAt: LocalDateTime
)

data class AchievementResponse(
    val goalTypeId: String,
    val goalTypeName: String,
    val startValue: BigDecimal,
    val targetValue: BigDecimal,
    val currentValue: BigDecimal?,
    val achievementRate: Double
)
