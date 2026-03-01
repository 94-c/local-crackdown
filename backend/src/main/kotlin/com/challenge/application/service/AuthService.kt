package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.Role
import com.challenge.domain.entity.User
import com.challenge.domain.repository.UserRepository
import com.challenge.infrastructure.security.JwtProvider
import com.challenge.infrastructure.security.KakaoOAuthService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtProvider: JwtProvider,
    private val kakaoOAuthService: KakaoOAuthService
) {

    @Transactional
    fun signUp(request: SignUpRequest): UserResponse {
        require(!userRepository.existsByEmail(request.email)) { "Email already exists" }

        val user = User(
            email = request.email,
            password = passwordEncoder.encode(request.password),
            nickname = request.nickname,
            role = Role.ADMIN
        )
        val saved = userRepository.save(user)

        return UserResponse(
            id = saved.id.toString(),
            email = saved.email,
            nickname = saved.nickname,
            profileImageUrl = saved.profileImageUrl,
            role = saved.role.name
        )
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): TokenResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw IllegalArgumentException("Invalid credentials")

        require(user.role == Role.ADMIN) { "Invalid credentials" }
        require(user.password != null && passwordEncoder.matches(request.password, user.password)) {
            "Invalid credentials"
        }

        val token = jwtProvider.generateToken(user.id.toString(), user.email, user.role.name)
        return TokenResponse(accessToken = token)
    }

    @Transactional
    fun kakaoLogin(code: String, redirectUri: String): TokenResponse {
        val kakaoUserInfo = kakaoOAuthService.kakaoLogin(code, redirectUri)

        val user = userRepository.findByKakaoId(kakaoUserInfo.kakaoId)
            ?: createKakaoUser(kakaoUserInfo)

        val token = jwtProvider.generateToken(user.id.toString(), user.email, user.role.name)
        return TokenResponse(accessToken = token)
    }

    private fun createKakaoUser(kakaoUserInfo: KakaoOAuthService.KakaoUserInfo): User {
        val email = kakaoUserInfo.email ?: "${kakaoUserInfo.kakaoId}@kakao.user"
        val user = User(
            email = email,
            password = null,
            nickname = kakaoUserInfo.nickname,
            role = Role.USER,
            kakaoId = kakaoUserInfo.kakaoId,
            profileImageUrl = kakaoUserInfo.profileImageUrl
        )
        return userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun getMe(userId: String): MeResponse {
        val user = userRepository.findById(UUID.fromString(userId))
            .orElseThrow { IllegalArgumentException("User not found") }

        return MeResponse(
            id = user.id.toString(),
            email = user.email,
            nickname = user.nickname,
            profileImageUrl = user.profileImageUrl,
            role = user.role.name
        )
    }
}
