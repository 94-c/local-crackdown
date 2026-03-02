package com.challenge.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "push_subscriptions",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "endpoint"])]
)
class PushSubscription(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(nullable = false, columnDefinition = "TEXT")
    val endpoint: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    val p256dh: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    val auth: String,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
