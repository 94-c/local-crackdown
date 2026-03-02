package com.challenge.application.dto

import jakarta.validation.constraints.NotBlank

data class PushSubscriptionRequest(
    @field:NotBlank
    val endpoint: String,

    @field:NotBlank
    val p256dh: String,

    @field:NotBlank
    val auth: String
)
