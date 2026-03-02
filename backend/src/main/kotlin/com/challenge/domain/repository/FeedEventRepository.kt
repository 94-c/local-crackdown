package com.challenge.domain.repository

import com.challenge.domain.entity.FeedEvent
import com.challenge.domain.entity.FeedEventType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface FeedEventRepository : JpaRepository<FeedEvent, UUID> {
    fun findByChallengeIdOrderByCreatedAtDesc(challengeId: UUID, pageable: Pageable): Page<FeedEvent>
    fun existsByEventTypeAndReferenceId(eventType: FeedEventType, referenceId: UUID): Boolean
}
