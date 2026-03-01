package com.challenge.presentation.controller

import com.challenge.application.dto.ChallengeResponse
import com.challenge.application.service.ChallengeService
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/challenges")
class ChallengeController(
    private val challengeService: ChallengeService
) {

    @GetMapping("/{id}")
    fun getChallenge(@PathVariable id: UUID): ChallengeResponse {
        return challengeService.getChallenge(id)
    }

    @PostMapping("/{id}/join")
    @ResponseStatus(HttpStatus.OK)
    fun joinChallenge(
        authentication: Authentication,
        @PathVariable id: UUID
    ) {
        val userId = UUID.fromString(authentication.principal as String)
        challengeService.joinChallenge(userId, id)
    }
}
