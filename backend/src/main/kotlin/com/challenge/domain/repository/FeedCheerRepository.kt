package com.challenge.domain.repository

import com.challenge.domain.entity.FeedCheer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface FeedCheerRepository : JpaRepository<FeedCheer, UUID> {
    fun countByFeedEventId(feedEventId: UUID): Long
    fun existsByFeedEventIdAndUserId(feedEventId: UUID, userId: UUID): Boolean
    fun findByFeedEventIdAndUserId(feedEventId: UUID, userId: UUID): FeedCheer?

    @Query("SELECT fc.feedEventId, COUNT(fc) FROM FeedCheer fc WHERE fc.feedEventId IN :feedEventIds GROUP BY fc.feedEventId")
    fun countByFeedEventIdIn(@Param("feedEventIds") feedEventIds: List<UUID>): List<Array<Any>>

    @Query("SELECT fc.feedEventId FROM FeedCheer fc WHERE fc.feedEventId IN :feedEventIds AND fc.userId = :userId")
    fun findCheeredEventIds(@Param("feedEventIds") feedEventIds: List<UUID>, @Param("userId") userId: UUID): List<UUID>
}
