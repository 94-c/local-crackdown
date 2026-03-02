package com.challenge.domain.repository

import com.challenge.domain.entity.PenaltyVerification
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PenaltyVerificationRepository : JpaRepository<PenaltyVerification, UUID> {
    fun findByPenaltyMissionId(penaltyMissionId: UUID): List<PenaltyVerification>
    fun deleteByPenaltyMissionId(penaltyMissionId: UUID)
}
