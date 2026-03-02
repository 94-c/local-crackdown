package com.challenge.presentation.controller

import com.challenge.application.dto.VerificationResponse
import com.challenge.application.service.MissionVerificationService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/verifications")
class AdminVerificationController(
    private val missionVerificationService: MissionVerificationService
) {

    @PutMapping("/{id}/approve")
    fun approveVerification(@PathVariable id: String): Map<String, String> {
        missionVerificationService.approveVerification(id)
        return mapOf("status" to "APPROVED")
    }

    @GetMapping
    fun getVerifications(@RequestParam teamMissionId: String): List<VerificationResponse> {
        return missionVerificationService.getVerificationsByMission(teamMissionId)
    }
}
