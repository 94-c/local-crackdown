package com.challenge.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "penalty_verifications")
class PenaltyVerification(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "penalty_mission_id", nullable = false)
    var penaltyMission: PenaltyMission,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    var user: User,

    @Column(columnDefinition = "TEXT")
    var memo: String? = null,

    @Column(name = "image_url", columnDefinition = "TEXT")
    var imageUrl: String? = null,

    @Column
    var approved: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
