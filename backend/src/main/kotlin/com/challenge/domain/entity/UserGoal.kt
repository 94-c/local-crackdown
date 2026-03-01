package com.challenge.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "user_goals")
class UserGoal(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "challenge_id", nullable = false)
    val challengeId: UUID,

    @Column(name = "goal_type_id", nullable = false)
    val goalTypeId: UUID,

    @Column(name = "target_value", nullable = false, precision = 5, scale = 2)
    var targetValue: BigDecimal,

    @Column(name = "start_value", nullable = false, precision = 5, scale = 2)
    var startValue: BigDecimal,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
