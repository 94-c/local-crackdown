package com.challenge.domain.repository

import com.challenge.domain.entity.UserGoal
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserGoalRepository : JpaRepository<UserGoal, UUID> {
    fun findByUserIdAndChallengeId(userId: UUID, challengeId: UUID): List<UserGoal>
    fun findByUserIdAndChallengeIdAndGoalTypeId(userId: UUID, challengeId: UUID, goalTypeId: UUID): UserGoal?
    fun existsByUserIdAndChallengeId(userId: UUID, challengeId: UUID): Boolean
    fun deleteByChallengeId(challengeId: UUID)
}
