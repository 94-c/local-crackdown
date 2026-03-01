package com.challenge.presentation.controller

import com.challenge.application.dto.FinalScoreResponse
import com.challenge.application.service.FinalScoreService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/final-scores")
class AdminFinalScoreController(
    private val finalScoreService: FinalScoreService
) {

    @PostMapping("/calculate")
    fun calculateFinalScores(
        @RequestParam challengeId: String
    ): List<FinalScoreResponse> {
        return finalScoreService.calculateFinalScores(challengeId)
    }

    @GetMapping
    fun getFinalRankings(
        @RequestParam challengeId: String
    ): List<FinalScoreResponse> {
        return finalScoreService.getFinalRankings(challengeId)
    }
}
