package com.challenge.presentation.controller

import com.challenge.application.dto.UserWeeklyResultResponse
import com.challenge.application.service.WeeklyCloseService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/weekly-results")
class WeeklyResultController(
    private val weeklyCloseService: WeeklyCloseService
) {

    @GetMapping("/me")
    fun getMyWeeklyResults(
        authentication: Authentication,
        @RequestParam challengeId: String
    ): List<UserWeeklyResultResponse> {
        val userId = authentication.principal as String
        return weeklyCloseService.getUserWeeklyResults(challengeId, userId)
    }
}
