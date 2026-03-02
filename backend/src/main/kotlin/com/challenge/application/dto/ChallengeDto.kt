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
    val durationDays: Int,

    val inbodyFrequencyDays: Int = 7,

    val goalTypeIds: List<String> = emptyList()
)

data class UpdateChallengeRequest(
    @field:Size(max = 100)
    val title: String? = null,

    val description: String? = null,

    val startDate: LocalDate? = null,

    val durationDays: Int? = null,

    val inbodyFrequencyDays: Int? = null,

    val status: String? = null,

    val goalTypeIds: List<String>? = null
)

data class ChallengeResponse(
    val id: String,
    val title: String,
    val description: String?,
    val inviteCode: String,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val durationDays: Int,
    val inbodyFrequencyDays: Int,
    val currentWeek: Int,
    val status: String,
    val goalTypes: List<GoalTypeResponse>,
    val createdAt: LocalDateTime
)

data class ChallengeInviteResponse(
    val id: String,
    val title: String,
    val description: String?,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val durationDays: Int,
    val inbodyFrequencyDays: Int,
    val status: String
)

data class ChallengeMemberDetailResponse(
    val userId: String,
    val nickname: String,
    val email: String,
    val hasInbody: Boolean,
    val lastInbodyDate: LocalDate?,
    val hasGoals: Boolean
)

data class ChallengeTeamDetailResponse(
    val teamId: String,
    val teamName: String,
    val members: List<ChallengeMemberDetailResponse>
)

data class ChallengeDetailWithMembersResponse(
    val challenge: ChallengeResponse,
    val teams: List<ChallengeTeamDetailResponse>,
    val totalTeams: Int,
    val totalMembers: Int
)
