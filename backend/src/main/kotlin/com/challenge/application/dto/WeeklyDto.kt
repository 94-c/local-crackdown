package com.challenge.application.dto

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal

data class CloseWeekRequest(
    @field:NotNull
    val challengeId: String,

    @field:NotNull
    @field:Positive
    val weekNumber: Int
)

data class WeeklyResultResponse(
    val teamName: String,
    val teamScore: BigDecimal,
    val teamRank: Int,
    val isBottomTeam: Boolean,
    val members: List<MemberResult>
)

data class MemberResult(
    val nickname: String,
    val achievementRate: BigDecimal
)

data class UserWeeklyResultResponse(
    val weekNumber: Int,
    val achievementRate: BigDecimal,
    val teamScore: BigDecimal,
    val teamRank: Int,
    val isBottomTeam: Boolean
)
