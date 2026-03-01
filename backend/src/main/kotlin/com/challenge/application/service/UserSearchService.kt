package com.challenge.application.service

import com.challenge.application.dto.UserResponse
import com.challenge.domain.entity.Role
import com.challenge.domain.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserSearchService(
    private val userRepository: UserRepository
) {
    @Transactional(readOnly = true)
    fun searchUsers(query: String): List<UserResponse> {
        return userRepository
            .findByNicknameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
            .filter { it.role == Role.USER }
            .map { user ->
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
}
