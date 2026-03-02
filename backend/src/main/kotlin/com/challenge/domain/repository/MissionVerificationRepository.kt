package com.challenge.domain.repository

import com.challenge.domain.entity.MissionVerification
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface MissionVerificationRepository : JpaRepository<MissionVerification, UUID> {
    fun findByTeamMissionId(teamMissionId: UUID): List<MissionVerification>
    fun deleteByTeamMissionId(teamMissionId: UUID)
}
