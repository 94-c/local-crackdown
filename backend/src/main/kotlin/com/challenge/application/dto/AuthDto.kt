package com.challenge.application.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class SignUpRequest(
    @field:Email
    @field:NotBlank
    val email: String,

    @field:NotBlank
    @field:Size(min = 8, max = 100)
    val password: String,

    @field:NotBlank
    @field:Size(min = 2, max = 50)
    val nickname: String
)

data class LoginRequest(
    @field:Email
    @field:NotBlank
    val email: String,

    @field:NotBlank
    val password: String
)

data class TokenResponse(
    val accessToken: String,
    val tokenType: String = "Bearer"
)

data class UserResponse(
    val id: String,
    val email: String,
    val nickname: String,
    val profileImageUrl: String?,
    val role: String,
    val gender: String?,
    val birthDate: LocalDate?,
    val height: BigDecimal?
)

data class MeResponse(
    val id: String,
    val email: String,
    val nickname: String,
    val profileImageUrl: String?,
    val role: String,
    val gender: String?,
    val birthDate: LocalDate?,
    val height: BigDecimal?
)

data class UpdateProfileRequest(
    val gender: String? = null,
    val birthDate: LocalDate? = null,
    val height: BigDecimal? = null
)

data class ProfileResponse(
    val id: String,
    val email: String,
    val nickname: String,
    val profileImageUrl: String?,
    val role: String,
    val gender: String?,
    val birthDate: LocalDate?,
    val height: BigDecimal?
)
