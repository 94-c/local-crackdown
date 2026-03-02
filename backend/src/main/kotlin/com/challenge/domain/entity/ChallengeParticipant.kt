package com.challenge.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

enum class ParticipantStatus {
    PENDING, APPROVED, REJECTED
}

@Entity
@Table(
    name = "challenge_participants",
    uniqueConstraints = [UniqueConstraint(columnNames = ["challenge_id", "user_id"])]
)
class ChallengeParticipant(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID? = null,

    @Column(name = "challenge_id", nullable = false)
    val challengeId: UUID,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ParticipantStatus = ParticipantStatus.PENDING,

    @Column(name = "joined_at", nullable = false)
    val joinedAt: LocalDateTime = LocalDateTime.now()
)
