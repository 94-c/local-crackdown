package com.challenge.domain.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "mission_verifications")
class MissionVerification(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_mission_id")
    var teamMission: TeamMission,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: User,

    @Column(name = "image_url", columnDefinition = "TEXT")
    var imageUrl: String? = null,

    @Column(columnDefinition = "TEXT")
    var memo: String? = null,

    @Column(nullable = false)
    var verified: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
