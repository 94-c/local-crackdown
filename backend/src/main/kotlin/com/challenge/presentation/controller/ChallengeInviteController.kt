package com.challenge.presentation.controller

import com.challenge.application.dto.ChallengeInviteResponse
import com.challenge.application.service.ChallengeService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/challenges")
class ChallengeInviteController(
    private val challengeService: ChallengeService
) {

    @GetMapping("/invite/{code}")
    fun getChallengeByInviteCode(@PathVariable code: String): ChallengeInviteResponse {
        return challengeService.getChallengeByInviteCode(code)
    }
}
