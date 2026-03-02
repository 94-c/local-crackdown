package com.challenge.application.service

import com.challenge.domain.entity.PushSubscription
import com.challenge.domain.repository.PushSubscriptionRepository
import com.fasterxml.jackson.databind.ObjectMapper
import nl.martijndwars.webpush.Notification
import nl.martijndwars.webpush.PushService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PushNotificationService(
    private val pushSubscriptionRepository: PushSubscriptionRepository,
    private val objectMapper: ObjectMapper,
    @Value("\${push.vapid.public-key:}") private val vapidPublicKey: String,
    @Value("\${push.vapid.private-key:}") private val vapidPrivateKey: String,
    @Value("\${push.vapid.subject:mailto:admin@local-crackdown.com}") private val vapidSubject: String
) {

    private val log = LoggerFactory.getLogger(javaClass)

    private val pushService: PushService? by lazy {
        if (vapidPublicKey.isBlank() || vapidPrivateKey.isBlank()) {
            log.warn("VAPID keys not configured. Push notifications disabled.")
            null
        } else {
            PushService().apply {
                setPublicKey(vapidPublicKey)
                setPrivateKey(vapidPrivateKey)
                setSubject(vapidSubject)
            }
        }
    }

    @Transactional
    fun subscribe(userId: UUID, endpoint: String, p256dh: String, auth: String): PushSubscription {
        if (pushSubscriptionRepository.existsByUserIdAndEndpoint(userId, endpoint)) {
            pushSubscriptionRepository.deleteByUserIdAndEndpoint(userId, endpoint)
        }
        return pushSubscriptionRepository.save(
            PushSubscription(
                userId = userId,
                endpoint = endpoint,
                p256dh = p256dh,
                auth = auth
            )
        )
    }

    @Transactional
    fun unsubscribe(userId: UUID, endpoint: String) {
        pushSubscriptionRepository.deleteByUserIdAndEndpoint(userId, endpoint)
    }

    @Async
    fun sendToUser(userId: UUID, title: String, body: String, url: String? = null) {
        val subscriptions = pushSubscriptionRepository.findByUserId(userId)
        for (sub in subscriptions) {
            sendPush(sub, title, body, url)
        }
    }

    @Async
    fun sendToUsers(userIds: List<UUID>, title: String, body: String, url: String? = null) {
        val subscriptions = pushSubscriptionRepository.findByUserIdIn(userIds)
        for (sub in subscriptions) {
            sendPush(sub, title, body, url)
        }
    }

    private fun sendPush(sub: PushSubscription, title: String, body: String, url: String?) {
        val service = pushService ?: return
        try {
            val payload = objectMapper.writeValueAsString(
                mapOf("title" to title, "body" to body, "url" to (url ?: "/"))
            )
            val notification = Notification(sub.endpoint, sub.p256dh, sub.auth, payload)
            service.send(notification)
        } catch (e: Exception) {
            log.warn("Push notification failed for endpoint ${sub.endpoint}: ${e.message}")
            if (e.message?.contains("410") == true || e.message?.contains("404") == true) {
                try {
                    pushSubscriptionRepository.delete(sub)
                    log.info("Cleaned up expired push subscription: ${sub.endpoint}")
                } catch (deleteEx: Exception) {
                    log.warn("Failed to clean up expired subscription: ${deleteEx.message}")
                }
            }
        }
    }
}
