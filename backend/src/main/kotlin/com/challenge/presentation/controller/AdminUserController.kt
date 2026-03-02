package com.challenge.presentation.controller

import com.challenge.application.dto.UserResponse
import com.challenge.application.service.UserSearchService
import com.challenge.domain.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

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

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUser(@PathVariable id: UUID) {
        val user = userRepository.findById(id)
            .orElseThrow { IllegalArgumentException("User not found") }
        userRepository.delete(user)
    }
}
