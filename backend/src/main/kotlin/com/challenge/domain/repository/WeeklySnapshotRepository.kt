package com.challenge.domain.repository

import com.challenge.domain.entity.WeeklySnapshot
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface WeeklySnapshotRepository : JpaRepository<WeeklySnapshot, UUID> {
    fun findByChallengeIdAndWeekNumber(challengeId: UUID, weekNumber: Int): List<WeeklySnapshot>
    fun findByChallengeIdAndWeekNumberAndUserId(challengeId: UUID, weekNumber: Int, userId: UUID): WeeklySnapshot?
    fun findByChallengeIdAndUserId(challengeId: UUID, userId: UUID): List<WeeklySnapshot>
    fun deleteByChallengeId(challengeId: UUID)
}
