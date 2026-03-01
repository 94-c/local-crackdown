package com.challenge.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "team_missions",
    uniqueConstraints = [UniqueConstraint(columnNames = ["team_id", "challenge_id", "week_number"])]
)
class TeamMission(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    var team: Team,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    var challenge: Challenge,

    @Column(name = "week_number", nullable = false)
    var weekNumber: Int,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_template_id")
    var missionTemplate: MissionTemplate,

    @Column(name = "target_value", nullable = false)
    var targetValue: BigDecimal,

    @Column(name = "current_value")
    var currentValue: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var status: String = "IN_PROGRESS",

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
