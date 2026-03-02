package com.challenge.domain.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "challenges")
class Challenge(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, length = 100)
    var title: String,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "invite_code", nullable = false, unique = true, length = 8)
    var inviteCode: String = generateInviteCode(),

    @Column(name = "start_date", nullable = false)
    var startDate: LocalDate,

    @Column(name = "end_date", nullable = false)
    var endDate: LocalDate,

    @Column(name = "duration_days", nullable = false)
    var durationDays: Int = 28,

    @Column(name = "inbody_frequency_days", nullable = false)
    var inbodyFrequencyDays: Int = 7,

    @Column(name = "current_week", nullable = false)
    var currentWeek: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: ChallengeStatus = ChallengeStatus.PREPARING,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @ManyToMany
    @JoinTable(
        name = "challenge_goal_types",
        joinColumns = [JoinColumn(name = "challenge_id")],
        inverseJoinColumns = [JoinColumn(name = "goal_type_id")]
    )
    var goalTypes: MutableSet<GoalType> = mutableSetOf()

    companion object {
        private val ALPHANUMERIC = ('A'..'Z') + ('a'..'z') + ('0'..'9')

        fun generateInviteCode(): String {
            return (1..8)
                .map { ALPHANUMERIC.random() }
                .joinToString("")
        }
    }
}
