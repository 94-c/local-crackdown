package com.challenge.domain.repository

import com.challenge.domain.entity.ChallengeParticipant
import com.challenge.domain.entity.ParticipantStatus
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ChallengeParticipantRepository : JpaRepository<ChallengeParticipant, UUID> {
    fun findByChallengeIdAndStatus(challengeId: UUID, status: ParticipantStatus): List<ChallengeParticipant>
    fun findByChallengeId(challengeId: UUID): List<ChallengeParticipant>
    fun existsByChallengeIdAndUserId(challengeId: UUID, userId: UUID): Boolean
    fun findByChallengeIdAndUserId(challengeId: UUID, userId: UUID): ChallengeParticipant?
    fun deleteByChallengeId(challengeId: UUID)
}
