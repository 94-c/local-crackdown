package com.challenge.presentation.controller

import com.challenge.application.dto.GoalTypeResponse
import com.challenge.application.service.GoalTypeService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/goal-types")
class GoalTypeController(
    private val goalTypeService: GoalTypeService
) {

    @GetMapping
    fun getGoalTypes(@RequestParam(required = false) challengeId: String?): List<GoalTypeResponse> {
        return if (challengeId != null) {
            goalTypeService.getGoalTypesByChallenge(challengeId)
        } else {
            goalTypeService.getGoalTypes()
        }
    }
}
