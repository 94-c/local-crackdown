package com.challenge.domain.repository

import com.challenge.domain.entity.InBodyRecord
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate
import java.util.UUID

interface InBodyRecordRepository : JpaRepository<InBodyRecord, UUID> {
    fun findByUserIdAndChallengeIdOrderByRecordDateDesc(userId: UUID, challengeId: UUID): List<InBodyRecord>
    fun findFirstByUserIdAndChallengeIdOrderByRecordDateDesc(userId: UUID, challengeId: UUID): InBodyRecord?
    fun existsByUserIdAndChallengeId(userId: UUID, challengeId: UUID): Boolean
    fun existsByUserIdAndChallengeIdAndRecordDateGreaterThanEqual(userId: UUID, challengeId: UUID, recordDate: LocalDate): Boolean
}
