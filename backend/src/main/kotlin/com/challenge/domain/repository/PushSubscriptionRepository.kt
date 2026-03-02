package com.challenge.domain.repository

import com.challenge.domain.entity.PushSubscription
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PushSubscriptionRepository : JpaRepository<PushSubscription, UUID> {
    fun findByUserId(userId: UUID): List<PushSubscription>
    fun findByUserIdIn(userIds: List<UUID>): List<PushSubscription>
    fun deleteByUserIdAndEndpoint(userId: UUID, endpoint: String)
    fun existsByUserIdAndEndpoint(userId: UUID, endpoint: String): Boolean
}
