package com.challenge.application.dto

data class GoalTypeResponse(
    val id: String,
    val name: String,
    val unit: String,
    val description: String?,
    val directionIsDecrease: Boolean
)
