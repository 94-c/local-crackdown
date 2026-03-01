package com.challenge.presentation.controller

import com.challenge.application.dto.UserResponse
import com.challenge.application.service.UserSearchService
import com.challenge.domain.repository.UserRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin/users")
class AdminUserController(
    private val userRepository: UserRepository,
    private val userSearchService: UserSearchService
) {

    @GetMapping
    fun getAllUsers(): List<UserResponse> {
        return userRepository.findAll().map { user ->
            UserResponse(
                id = user.id.toString(),
                email = user.email,
                nickname = user.nickname,
                profileImageUrl = user.profileImageUrl,
                role = user.role.name,
                gender = user.gender,
                birthDate = user.birthDate,
                height = user.height
            )
        }
    }

    @GetMapping("/search")
    fun searchUsers(@RequestParam q: String): List<UserResponse> {
        return userSearchService.searchUsers(q)
    }
}
