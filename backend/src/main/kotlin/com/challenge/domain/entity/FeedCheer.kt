package com.challenge.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "feed_cheers",
    uniqueConstraints = [UniqueConstraint(columnNames = ["feed_event_id", "user_id"])]
)
class FeedCheer(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "feed_event_id", nullable = false)
    val feedEventId: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
