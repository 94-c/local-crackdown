package com.challenge.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "weekly_snapshots")
class WeeklySnapshot(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    val challenge: Challenge,

    @Column(name = "week_number", nullable = false)
    val weekNumber: Int,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    val team: Team,

    @Column(name = "achievement_rate", nullable = false)
    var achievementRate: BigDecimal = BigDecimal.ZERO,

    @Column(name = "team_score", nullable = false)
    var teamScore: BigDecimal = BigDecimal.ZERO,

    @Column(name = "team_rank", nullable = false)
    var teamRank: Int = 0,

    @Column(name = "is_bottom_team", nullable = false)
    var isBottomTeam: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
