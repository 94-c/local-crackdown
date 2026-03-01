package com.challenge.domain.repository

import com.challenge.domain.entity.Challenge
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChallengeRepository : JpaRepository<Challenge, UUID> {
    fun findByInviteCode(inviteCode: String): Challenge?
}
