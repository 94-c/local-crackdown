package com.challenge.domain.repository

import com.challenge.domain.entity.ChallengeParticipant
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChallengeParticipantRepository : JpaRepository<ChallengeParticipant, UUID> {
    fun findByChallengeId(challengeId: UUID): List<ChallengeParticipant>
    fun existsByChallengeIdAndUserId(challengeId: UUID, userId: UUID): Boolean
}
