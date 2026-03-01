package com.challenge.application.dto

import java.math.BigDecimal

data class FinalScoreResponse(
    val teamName: String,
    val totalScore: BigDecimal,
    val finalRank: Int
)
