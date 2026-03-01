package com.challenge.domain.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false, unique = true, length = 100)
    var email: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false, length = 50)
    var nickname: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: Role = Role.USER,

    @Column(name = "profile_image_url")
    var profileImageUrl: String? = null,

    @Column(length = 10)
    var gender: String? = null,

    @Column(name = "birth_date")
    var birthDate: LocalDate? = null,

    @Column(precision = 5, scale = 1)
    var height: BigDecimal? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
