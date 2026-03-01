package com.challenge.infrastructure.config

import com.challenge.domain.entity.Role
import com.challenge.domain.entity.User
import com.challenge.domain.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class DataSeeder(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun run(args: ApplicationArguments) {
        val adminEmail = "admin@challenge.com"

        if (!userRepository.existsByEmail(adminEmail)) {
            val admin = User(
                email = adminEmail,
                password = passwordEncoder.encode("admin1234!"),
                nickname = "관리자",
                role = Role.ADMIN
            )
            userRepository.save(admin)
            log.info("Admin account created: $adminEmail")
        } else {
            log.info("Admin account already exists: $adminEmail")
        }
    }
}
