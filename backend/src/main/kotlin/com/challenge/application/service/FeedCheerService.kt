package com.challenge.application.service

import com.challenge.application.dto.CheerToggleResponse
import com.challenge.domain.entity.FeedCheer
import com.challenge.domain.repository.FeedCheerRepository
import com.challenge.domain.repository.FeedEventRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FeedCheerService(
    private val feedCheerRepository: FeedCheerRepository,
    private val feedEventRepository: FeedEventRepository,
    private val notificationService: NotificationService
) {

    @Transactional
    fun toggleCheer(feedEventId: String, userId: String): CheerToggleResponse {
        val eventUuid = UUID.fromString(feedEventId)
        val userUuid = UUID.fromString(userId)

        val event = feedEventRepository.findById(eventUuid)
            .orElseThrow { IllegalArgumentException("Feed event not found") }

        val existing = feedCheerRepository.findByFeedEventIdAndUserId(eventUuid, userUuid)

        if (existing != null) {
            feedCheerRepository.delete(existing)
            val count = feedCheerRepository.countByFeedEventId(eventUuid)
            return CheerToggleResponse(cheered = false, cheerCount = count)
        } else {
            feedCheerRepository.save(FeedCheer(feedEventId = eventUuid, userId = userUuid))
            val count = feedCheerRepository.countByFeedEventId(eventUuid)

            if (event.user.id != userUuid) {
                notificationService.create(
                    userId = event.user.id!!,
                    title = "응원 받음",
                    message = "누군가 당신의 활동에 응원을 보냈습니다!",
                    type = "CHEER",
                    link = "/feed"
                )
            }

            return CheerToggleResponse(cheered = true, cheerCount = count)
        }
    }
}
