package com.challenge.domain.repository

import com.challenge.domain.entity.FinalScore
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface FinalScoreRepository : JpaRepository<FinalScore, UUID> {
    fun findByChallengeIdOrderByFinalRankAsc(challengeId: UUID): List<FinalScore>
    fun findByChallengeIdAndTeamId(challengeId: UUID, teamId: UUID): FinalScore?
    fun deleteByChallengeId(challengeId: UUID)
}
