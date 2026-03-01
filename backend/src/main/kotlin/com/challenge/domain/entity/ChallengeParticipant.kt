package com.challenge.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "challenge_participants")
class ChallengeParticipant(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "challenge_id", nullable = false)
    val challengeId: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "joined_at", nullable = false, updatable = false)
    val joinedAt: LocalDateTime = LocalDateTime.now()
)
