package com.challenge.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "final_scores",
    uniqueConstraints = [UniqueConstraint(columnNames = ["challenge_id", "team_id"])]
)
class FinalScore(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    var challenge: Challenge,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    var team: Team,

    @Column(name = "total_score", nullable = false)
    var totalScore: BigDecimal = BigDecimal.ZERO,

    @Column(name = "final_rank", nullable = false)
    var finalRank: Int = 0,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
