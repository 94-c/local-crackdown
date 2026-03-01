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

    @Column(name = "start_date", nullable = false)
    var startDate: LocalDate,

    @Column(name = "end_date", nullable = false)
    var endDate: LocalDate,

    @Column(name = "current_week", nullable = false)
    var currentWeek: Int = 0,

    @Column(name = "invite_code", nullable = false, unique = true, length = 8)
    var inviteCode: String = generateInviteCode(),

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: ChallengeStatus = ChallengeStatus.PREPARING,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun generateInviteCode(): String {
            val chars = "abcdefghijklmnopqrstuvwxyz0123456789"
            return (1..8).map { chars.random() }.joinToString("")
        }
    }
}
