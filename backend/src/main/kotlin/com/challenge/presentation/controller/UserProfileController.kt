package com.challenge.presentation.controller

import com.challenge.application.dto.ProfileResponse
import com.challenge.application.dto.UpdateProfileRequest
import com.challenge.application.service.AuthService
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserProfileController(
    private val authService: AuthService
) {

    @GetMapping("/profile")
    fun getProfile(authentication: Authentication): ProfileResponse {
        val userId = authentication.principal as String
        return authService.getProfile(userId)
    }

    @PutMapping("/profile")
    fun updateProfile(
        authentication: Authentication,
        @Valid @RequestBody request: UpdateProfileRequest
    ): ProfileResponse {
        val userId = authentication.principal as String
        return authService.updateProfile(userId, request)
    }
}
