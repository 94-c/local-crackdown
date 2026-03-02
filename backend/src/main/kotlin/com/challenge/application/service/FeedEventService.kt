package com.challenge.application.service

import com.challenge.application.dto.FeedEventResponse
import com.challenge.application.dto.FeedPageResponse
import com.challenge.domain.entity.FeedEvent
import com.challenge.domain.entity.FeedEventType
import com.challenge.domain.entity.User
import com.challenge.domain.repository.FeedCheerRepository
import com.challenge.domain.repository.FeedEventRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FeedEventService(
    private val feedEventRepository: FeedEventRepository,
    private val feedCheerRepository: FeedCheerRepository
) {

    @Transactional
    fun publishEvent(
        challengeId: UUID,
        user: User,
        eventType: FeedEventType,
        referenceId: UUID,
        title: String,
        description: String?,
        imageUrl: String?
    ): FeedEvent {
        if (feedEventRepository.existsByEventTypeAndReferenceId(eventType, referenceId)) {
            return feedEventRepository.findAll().first()
        }

        val event = FeedEvent(
            challengeId = challengeId,
            user = user,
            eventType = eventType,
            referenceId = referenceId,
            title = title,
            description = description,
            imageUrl = imageUrl
        )
        return feedEventRepository.save(event)
    }

    @Transactional(readOnly = true)
    fun getFeed(challengeId: String, userId: String, page: Int, size: Int): FeedPageResponse {
        val challengeUuid = UUID.fromString(challengeId)
        val userUuid = UUID.fromString(userId)
        val pageable = PageRequest.of(page, size)

        val feedPage = feedEventRepository.findByChallengeIdOrderByCreatedAtDesc(challengeUuid, pageable)
        val eventIds = feedPage.content.mapNotNull { it.id }

        val cheerCounts = if (eventIds.isNotEmpty()) {
            feedCheerRepository.countByFeedEventIdIn(eventIds)
                .associate { (it[0] as UUID) to (it[1] as Long) }
        } else emptyMap()

        val cheeredByMe = if (eventIds.isNotEmpty()) {
            feedCheerRepository.findCheeredEventIds(eventIds, userUuid).toSet()
        } else emptySet()

        val content = feedPage.content.map { event ->
            FeedEventResponse(
                id = event.id.toString(),
                userId = event.user.id.toString(),
                userNickname = event.user.nickname,
                userProfileImageUrl = event.user.profileImageUrl,
                eventType = event.eventType.name,
                referenceId = event.referenceId.toString(),
                title = event.title,
                description = event.description,
                imageUrl = event.imageUrl,
                cheerCount = cheerCounts[event.id] ?: 0L,
                cheeredByMe = event.id in cheeredByMe,
                createdAt = event.createdAt
            )
        }

        return FeedPageResponse(
            content = content,
            page = feedPage.number,
            size = feedPage.size,
            totalElements = feedPage.totalElements,
            totalPages = feedPage.totalPages,
            hasNext = feedPage.hasNext()
        )
    }
}
