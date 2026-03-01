package com.challenge.presentation.controller

import com.challenge.application.dto.ProfileResponse
import com.challenge.application.dto.UpdateProfileRequest
import com.challenge.application.service.AuthService
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users/profile")
class UserProfileController(
    private val authService: AuthService
) {

    @GetMapping
    fun getProfile(authentication: Authentication): ProfileResponse {
        val userId = authentication.principal as String
        val me = authService.getMe(userId)
        return ProfileResponse(
            id = me.id,
            email = me.email,
            nickname = me.nickname,
            profileImageUrl = me.profileImageUrl,
            role = me.role,
            gender = me.gender,
            birthDate = me.birthDate,
            height = me.height
        )
    }

    @PutMapping
    fun updateProfile(
        authentication: Authentication,
        @Valid @RequestBody request: UpdateProfileRequest
    ): ProfileResponse {
        val userId = authentication.principal as String
        return authService.updateProfile(userId, request)
    }
}
