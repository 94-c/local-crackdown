package com.challenge.presentation.controller

import com.challenge.application.dto.CreateVerificationRequest
import com.challenge.application.dto.VerificationResponse
import com.challenge.application.service.MissionVerificationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/verifications")
class MissionVerificationController(
    private val missionVerificationService: MissionVerificationService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createVerification(
        authentication: Authentication,
        @Valid @RequestBody request: CreateVerificationRequest
    ): VerificationResponse {
        val userId = authentication.principal as String
        return missionVerificationService.createVerification(userId, request)
    }

    @GetMapping
    fun getVerifications(
        @RequestParam teamMissionId: String
    ): List<VerificationResponse> {
        return missionVerificationService.getVerificationsByMission(teamMissionId)
    }
}
