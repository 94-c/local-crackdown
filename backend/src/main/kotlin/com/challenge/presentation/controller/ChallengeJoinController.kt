package com.challenge.presentation.controller

import com.challenge.application.dto.ParticipantStatusResponse
import com.challenge.application.service.ChallengeParticipantService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/challenges")
class ChallengeJoinController(
    private val participantService: ChallengeParticipantService
) {

    @PostMapping("/{id}/join")
    fun joinChallenge(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ParticipantStatusResponse {
        val userId = UUID.fromString(authentication.principal as String)
        return participantService.joinChallenge(id, userId)
    }

    @GetMapping("/{id}/my-status")
    fun getMyStatus(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ParticipantStatusResponse {
        val userId = UUID.fromString(authentication.principal as String)
        return participantService.getMyStatus(id, userId)
    }
}
