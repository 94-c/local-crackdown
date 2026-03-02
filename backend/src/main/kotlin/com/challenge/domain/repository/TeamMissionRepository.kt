package com.challenge.domain.repository

import com.challenge.domain.entity.TeamMission
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TeamMissionRepository : JpaRepository<TeamMission, UUID> {
    fun findByTeamIdAndChallengeId(teamId: UUID, challengeId: UUID): List<TeamMission>
    fun findByTeamIdAndChallengeIdAndWeekNumber(teamId: UUID, challengeId: UUID, weekNumber: Int): TeamMission?
    fun deleteByTeamIdAndChallengeId(teamId: UUID, challengeId: UUID)
}
