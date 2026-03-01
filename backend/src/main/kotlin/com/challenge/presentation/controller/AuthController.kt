package com.challenge.presentation.controller

import com.challenge.application.dto.LoginRequest
import com.challenge.application.dto.SignUpRequest
import com.challenge.application.dto.TokenResponse
import com.challenge.application.dto.UserResponse
import com.challenge.application.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    fun signUp(@Valid @RequestBody request: SignUpRequest): UserResponse {
        return authService.signUp(request)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): TokenResponse {
        return authService.login(request)
    }
}
