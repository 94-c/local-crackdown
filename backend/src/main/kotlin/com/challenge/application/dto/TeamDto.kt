package com.challenge.application.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

data class CreateTeamRequest(
    @field:NotBlank
    @field:Size(max = 50)
    val name: String,

    @field:NotNull
    val challengeId: UUID,

    @field:NotNull
    val member1Id: UUID,

    val member2Id: UUID? = null
)

data class TeamResponse(
    val id: String,
    val name: String,
    val challengeId: String,
    val member1: UserResponse,
    val member2: UserResponse?,
    val createdAt: LocalDateTime
)
