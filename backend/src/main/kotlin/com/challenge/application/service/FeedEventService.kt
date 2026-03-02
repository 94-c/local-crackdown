package com.challenge.application.service

import com.challenge.application.dto.CreateFeedPostRequest
import com.challenge.application.dto.FeedEventResponse
import com.challenge.application.dto.FeedPageResponse
import com.challenge.application.dto.UpdateFeedPostRequest
import com.challenge.domain.entity.FeedEvent
import com.challenge.domain.entity.FeedEventType
import com.challenge.domain.entity.User
import com.challenge.domain.repository.FeedCheerRepository
import com.challenge.domain.repository.FeedEventRepository
import com.challenge.domain.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FeedEventService(
    private val feedEventRepository: FeedEventRepository,
    private val feedCheerRepository: FeedCheerRepository,
    private val userRepository: UserRepository
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

    @Transactional
    fun createPost(userId: String, request: CreateFeedPostRequest): FeedEventResponse {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(request.challengeId)
        val user = userRepository.findById(userUuid)
            .orElseThrow { IllegalArgumentException("User not found") }

        val event = FeedEvent(
            challengeId = challengeUuid,
            user = user,
            eventType = FeedEventType.USER_POST,
            referenceId = userUuid,
            title = request.title,
            description = request.description,
            imageUrl = request.imageUrl
        )
        val saved = feedEventRepository.save(event)

        return FeedEventResponse(
            id = saved.id.toString(),
            userId = user.id.toString(),
            userNickname = user.nickname,
            userProfileImageUrl = user.profileImageUrl,
            eventType = saved.eventType.name,
            referenceId = saved.referenceId.toString(),
            title = saved.title,
            description = saved.description,
            imageUrl = saved.imageUrl,
            cheerCount = 0L,
            cheeredByMe = false,
            createdAt = saved.createdAt
        )
    }

    @Transactional
    fun updatePost(userId: String, feedEventId: String, request: UpdateFeedPostRequest): FeedEventResponse {
        val userUuid = UUID.fromString(userId)
        val eventUuid = UUID.fromString(feedEventId)
        val event = feedEventRepository.findById(eventUuid)
            .orElseThrow { IllegalArgumentException("Feed event not found") }

        require(event.user.id == userUuid) { "You can only edit your own posts" }
        require(event.eventType == FeedEventType.USER_POST) { "Only manual posts can be edited" }

        event.title = request.title
        event.description = request.description
        event.imageUrl = request.imageUrl

        val saved = feedEventRepository.save(event)

        val cheerCount = feedCheerRepository.countByFeedEventId(saved.id!!)
        val cheeredByMe = feedCheerRepository.existsByFeedEventIdAndUserId(saved.id!!, userUuid)

        return FeedEventResponse(
            id = saved.id.toString(),
            userId = saved.user.id.toString(),
            userNickname = saved.user.nickname,
            userProfileImageUrl = saved.user.profileImageUrl,
            eventType = saved.eventType.name,
            referenceId = saved.referenceId.toString(),
            title = saved.title,
            description = saved.description,
            imageUrl = saved.imageUrl,
            cheerCount = cheerCount,
            cheeredByMe = cheeredByMe,
            createdAt = saved.createdAt
        )
    }

    @Transactional
    fun deleteEvent(userId: String, feedEventId: String) {
        val userUuid = UUID.fromString(userId)
        val eventUuid = UUID.fromString(feedEventId)
        val event = feedEventRepository.findById(eventUuid)
            .orElseThrow { IllegalArgumentException("Feed event not found") }

        require(event.user.id == userUuid) { "You can only delete your own posts" }

        feedCheerRepository.deleteByFeedEventId(eventUuid)
        feedEventRepository.delete(event)
    }
}
