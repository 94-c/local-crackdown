package com.challenge.domain.repository

import com.challenge.domain.entity.PenaltyMission
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PenaltyMissionRepository : JpaRepository<PenaltyMission, UUID> {
    fun findByChallengeIdAndWeekNumber(challengeId: UUID, weekNumber: Int): List<PenaltyMission>
    fun findByChallengeIdAndTeamId(challengeId: UUID, teamId: UUID): List<PenaltyMission>
    fun findByTeamIdAndWeekNumber(teamId: UUID, weekNumber: Int): List<PenaltyMission>
    fun deleteByChallengeIdAndTeamId(challengeId: UUID, teamId: UUID)
}
