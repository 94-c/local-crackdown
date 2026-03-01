package com.challenge.presentation.controller

import com.challenge.application.dto.CreatePenaltyVerificationRequest
import com.challenge.application.dto.PenaltyMissionResponse
import com.challenge.application.dto.PenaltyVerificationResponse
import com.challenge.application.service.PenaltyMissionService
import com.challenge.application.service.PenaltyVerificationService
import com.challenge.domain.repository.TeamRepository
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api")
class PenaltyController(
    private val penaltyMissionService: PenaltyMissionService,
    private val penaltyVerificationService: PenaltyVerificationService,
    private val teamRepository: TeamRepository
) {

    @GetMapping("/penalties/me")
    fun getMyPenalties(
        authentication: Authentication,
        @RequestParam challengeId: String
    ): List<PenaltyMissionResponse> {
        val userId = UUID.fromString(authentication.principal as String)

        // Find user's team for this challenge
        val teams = teamRepository.findByMember1IdOrMember2Id(userId, userId)
        val challengeUuid = UUID.fromString(challengeId)
        val myTeam = teams.find { it.challenge.id == challengeUuid }
            ?: throw IllegalArgumentException("User does not belong to any team in this challenge")

        return penaltyMissionService.getMissionsByTeam(challengeId, myTeam.id.toString())
    }

    @PostMapping("/penalty-verifications")
    @ResponseStatus(HttpStatus.CREATED)
    fun submitVerification(
        authentication: Authentication,
        @Valid @RequestBody request: CreatePenaltyVerificationRequest
    ): PenaltyVerificationResponse {
        val userId = authentication.principal as String
        return penaltyVerificationService.createVerification(userId, request)
    }
}
