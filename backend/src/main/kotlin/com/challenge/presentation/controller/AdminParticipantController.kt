package com.challenge.presentation.controller

import com.challenge.application.dto.ParticipantResponse
import com.challenge.application.service.ChallengeParticipantService
import com.challenge.domain.entity.ParticipantStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/admin/participants")
class AdminParticipantController(
    private val participantService: ChallengeParticipantService
) {

    @GetMapping
    fun getParticipants(
        @RequestParam challengeId: UUID,
        @RequestParam(required = false) status: ParticipantStatus?
    ): List<ParticipantResponse> {
        return participantService.getParticipants(challengeId, status)
    }

    @PutMapping("/{id}/approve")
    fun approveParticipant(@PathVariable id: UUID) {
        participantService.approveParticipant(id)
    }

    @PutMapping("/{id}/reject")
    fun rejectParticipant(@PathVariable id: UUID) {
        participantService.rejectParticipant(id)
    }

    @PostMapping("/approve-all")
    fun approveAll(@RequestParam challengeId: UUID) {
        participantService.approveAll(challengeId)
    }
}
