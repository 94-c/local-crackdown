package com.challenge.presentation.controller

import com.challenge.application.dto.CloseWeekRequest
import com.challenge.application.dto.WeeklyResultResponse
import com.challenge.application.service.WeeklyCloseService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminWeeklyCloseController(
    private val weeklyCloseService: WeeklyCloseService
) {

    @PostMapping("/weekly-close")
    fun closeWeek(@Valid @RequestBody request: CloseWeekRequest): List<WeeklyResultResponse> {
        return weeklyCloseService.closeWeek(request)
    }

    @GetMapping("/weekly-results")
    fun getWeeklyResults(
        @RequestParam challengeId: String,
        @RequestParam weekNumber: Int
    ): List<WeeklyResultResponse> {
        return weeklyCloseService.getWeeklyResults(challengeId, weekNumber)
    }
}
