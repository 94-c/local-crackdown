package com.challenge.presentation.controller

import com.challenge.application.dto.AchievementResponse
import com.challenge.application.dto.UserGoalRequest
import com.challenge.application.dto.UserGoalResponse
import com.challenge.application.service.UserGoalService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/goals")
class UserGoalController(
    private val userGoalService: UserGoalService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun setGoals(
        authentication: Authentication,
        @Valid @RequestBody request: UserGoalRequest
    ): List<UserGoalResponse> {
        val userId = authentication.principal as String
        return userGoalService.setGoals(userId, request)
    }

    @GetMapping
    fun getGoals(
        authentication: Authentication,
        @RequestParam challengeId: String
    ): List<UserGoalResponse> {
        val userId = authentication.principal as String
        return userGoalService.getGoalsByUserAndChallenge(userId, challengeId)
    }

    @GetMapping("/achievement")
    fun getAchievement(
        authentication: Authentication,
        @RequestParam challengeId: String
    ): List<AchievementResponse> {
        val userId = authentication.principal as String
        return userGoalService.calculateAchievementRates(userId, challengeId)
    }
}
