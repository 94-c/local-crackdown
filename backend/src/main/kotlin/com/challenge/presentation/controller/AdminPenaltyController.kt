package com.challenge.presentation.controller

import com.challenge.application.dto.AssignPenaltyRequest
import com.challenge.application.dto.PenaltyMissionResponse
import com.challenge.application.dto.PenaltyVerificationResponse
import com.challenge.application.dto.UpdatePenaltyStatusRequest
import com.challenge.application.service.PenaltyMissionService
import com.challenge.application.service.PenaltyVerificationService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminPenaltyController(
    private val penaltyMissionService: PenaltyMissionService,
    private val penaltyVerificationService: PenaltyVerificationService
) {

    @PostMapping("/penalties")
    @ResponseStatus(HttpStatus.CREATED)
    fun assignPenalty(
        @Valid @RequestBody request: AssignPenaltyRequest
    ): PenaltyMissionResponse {
        return penaltyMissionService.assignMission(request)
    }

    @GetMapping("/penalties")
    fun getPenaltiesByWeek(
        @RequestParam challengeId: String,
        @RequestParam weekNumber: Int
    ): List<PenaltyMissionResponse> {
        return penaltyMissionService.getMissionsByWeek(challengeId, weekNumber)
    }

    @PutMapping("/penalties/{id}/status")
    fun updatePenaltyStatus(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdatePenaltyStatusRequest
    ): PenaltyMissionResponse {
        return penaltyMissionService.updateStatus(id, request.status)
    }

    @PutMapping("/penalty-verifications/{id}/approve")
    fun approveVerification(
        @PathVariable id: String
    ): PenaltyVerificationResponse {
        return penaltyVerificationService.approveVerification(id)
    }
}
