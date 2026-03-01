package com.challenge.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "inbody_records")
class InBodyRecord(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "challenge_id", nullable = true)
    val challengeId: UUID? = null,

    @Column(nullable = false, precision = 5, scale = 2)
    var weight: BigDecimal,

    @Column(name = "skeletal_muscle_mass", nullable = false, precision = 5, scale = 2)
    var skeletalMuscleMass: BigDecimal,

    @Column(name = "body_fat_percentage", nullable = false, precision = 5, scale = 2)
    var bodyFatPercentage: BigDecimal,

    @Column(name = "body_fat_mass", precision = 5, scale = 2)
    var bodyFatMass: BigDecimal? = null,

    @Column(name = "record_date", nullable = false)
    var recordDate: LocalDate,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
