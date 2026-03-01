package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.User
import com.challenge.domain.repository.UserRepository
import com.challenge.infrastructure.security.JwtProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtProvider: JwtProvider
) {

    @Transactional
    fun signUp(request: SignUpRequest): UserResponse {
        require(!userRepository.existsByEmail(request.email)) { "Email already exists" }

        val user = User(
            email = request.email,
            password = passwordEncoder.encode(request.password),
            nickname = request.nickname
        )
        val saved = userRepository.save(user)

        return UserResponse(
            id = saved.id.toString(),
            email = saved.email,
            nickname = saved.nickname,
            profileImageUrl = saved.profileImageUrl
        )
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): TokenResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw IllegalArgumentException("Invalid credentials")

        require(passwordEncoder.matches(request.password, user.password)) { "Invalid credentials" }

        val token = jwtProvider.generateToken(user.id.toString(), user.email)
        return TokenResponse(accessToken = token)
    }
}
