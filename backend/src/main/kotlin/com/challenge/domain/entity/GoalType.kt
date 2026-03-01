package com.challenge.domain.entity

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "goal_types")
class GoalType(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 50)
    var name: String,

    @Column(nullable = false, length = 20)
    var unit: String,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "direction_is_decrease", nullable = false)
    var directionIsDecrease: Boolean = true
)
