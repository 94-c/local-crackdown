package com.challenge.presentation.controller

import com.challenge.application.dto.PushSubscriptionRequest
import com.challenge.application.service.PushNotificationService
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/push")
class PushSubscriptionController(
    private val pushNotificationService: PushNotificationService,
    @Value("\${push.vapid.public-key:}") private val vapidPublicKey: String
) {

    @PostMapping("/subscribe")
    @ResponseStatus(HttpStatus.CREATED)
    fun subscribe(
        authentication: Authentication,
        @Valid @RequestBody request: PushSubscriptionRequest
    ): Map<String, String> {
        val userId = UUID.fromString(authentication.principal as String)
        pushNotificationService.subscribe(userId, request.endpoint, request.p256dh, request.auth)
        return mapOf("status" to "subscribed")
    }

    @PostMapping("/unsubscribe")
    fun unsubscribe(
        authentication: Authentication,
        @RequestBody body: Map<String, String>
    ): Map<String, String> {
        val userId = UUID.fromString(authentication.principal as String)
        val endpoint = body["endpoint"] ?: throw IllegalArgumentException("endpoint is required")
        pushNotificationService.unsubscribe(userId, endpoint)
        return mapOf("status" to "unsubscribed")
    }

    @GetMapping("/vapid-public-key")
    fun getVapidPublicKey(): Map<String, String> {
        return mapOf("publicKey" to vapidPublicKey)
    }
}
