package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.UserGoal
import com.challenge.domain.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID

@Service
class UserGoalService(
    private val userGoalRepository: UserGoalRepository,
    private val goalTypeRepository: GoalTypeRepository,
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val userRepository: UserRepository,
    private val challengeRepository: ChallengeRepository
) {

    @Transactional
    fun setGoals(userId: String, request: UserGoalRequest): List<UserGoalResponse> {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(request.challengeId)

        userRepository.findById(userUuid)
            .orElseThrow { IllegalArgumentException("User not found") }
        challengeRepository.findById(challengeUuid)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val responses = request.goals.map { goalItem ->
            val goalTypeUuid = UUID.fromString(goalItem.goalTypeId)
            val goalType = goalTypeRepository.findById(goalTypeUuid)
                .orElseThrow { IllegalArgumentException("GoalType not found: ${goalItem.goalTypeId}") }

            val existing = userGoalRepository.findByUserIdAndChallengeIdAndGoalTypeId(
                userUuid, challengeUuid, goalTypeUuid
            )

            val userGoal = if (existing != null) {
                existing.targetValue = goalItem.targetValue
                existing.startValue = goalItem.startValue
                existing
            } else {
                UserGoal(
                    userId = userUuid,
                    challengeId = challengeUuid,
                    goalTypeId = goalTypeUuid,
                    targetValue = goalItem.targetValue,
                    startValue = goalItem.startValue
                )
            }

            val saved = userGoalRepository.save(userGoal)
            UserGoalResponse(
                id = saved.id.toString(),
                userId = saved.userId.toString(),
                challengeId = saved.challengeId.toString(),
                goalTypeId = saved.goalTypeId.toString(),
                goalTypeName = goalType.name,
                targetValue = saved.targetValue,
                startValue = saved.startValue,
                createdAt = saved.createdAt
            )
        }
        return responses
    }

    @Transactional(readOnly = true)
    fun getGoalsByUserAndChallenge(userId: String, challengeId: String): List<UserGoalResponse> {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(challengeId)
        val goals = userGoalRepository.findByUserIdAndChallengeId(userUuid, challengeUuid)

        return goals.map { goal ->
            val goalType = goalTypeRepository.findById(goal.goalTypeId)
                .orElseThrow { IllegalArgumentException("GoalType not found") }
            UserGoalResponse(
                id = goal.id.toString(),
                userId = goal.userId.toString(),
                challengeId = goal.challengeId.toString(),
                goalTypeId = goal.goalTypeId.toString(),
                goalTypeName = goalType.name,
                targetValue = goal.targetValue,
                startValue = goal.startValue,
                createdAt = goal.createdAt
            )
        }
    }

    @Transactional(readOnly = true)
    fun calculateAchievementRates(userId: String, challengeId: String): List<AchievementResponse> {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(challengeId)

        val goals = userGoalRepository.findByUserIdAndChallengeId(userUuid, challengeUuid)
        if (goals.isEmpty()) return emptyList()

        val latestRecord = inBodyRecordRepository
            .findFirstByUserIdAndChallengeIdOrderByRecordDateDesc(userUuid, challengeUuid)

        return goals.map { goal ->
            val goalType = goalTypeRepository.findById(goal.goalTypeId)
                .orElseThrow { IllegalArgumentException("GoalType not found") }

            val currentValue = latestRecord?.let { record ->
                when (goalType.name) {
                    "체중 감량" -> record.weight
                    "근육량 증가" -> record.skeletalMuscleMass
                    "체지방률 감소" -> record.bodyFatPercentage
                    else -> null
                }
            }

            val rate = if (currentValue != null) {
                calculateRate(
                    directionIsDecrease = goalType.directionIsDecrease,
                    startValue = goal.startValue,
                    targetValue = goal.targetValue,
                    currentValue = currentValue
                )
            } else {
                0.0
            }

            AchievementResponse(
                goalTypeId = goal.goalTypeId.toString(),
                goalTypeName = goalType.name,
                startValue = goal.startValue,
                targetValue = goal.targetValue,
                currentValue = currentValue,
                achievementRate = rate
            )
        }
    }

    private fun calculateRate(
        directionIsDecrease: Boolean,
        startValue: BigDecimal,
        targetValue: BigDecimal,
        currentValue: BigDecimal
    ): Double {
        val rate = if (directionIsDecrease) {
            // decrease goal: (startValue - currentValue) / (startValue - targetValue) * 100
            val denominator = startValue.subtract(targetValue)
            if (denominator.compareTo(BigDecimal.ZERO) == 0) 100.0
            else startValue.subtract(currentValue)
                .divide(denominator, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))
                .toDouble()
        } else {
            // increase goal: (currentValue - startValue) / (targetValue - startValue) * 100
            val denominator = targetValue.subtract(startValue)
            if (denominator.compareTo(BigDecimal.ZERO) == 0) 100.0
            else currentValue.subtract(startValue)
                .divide(denominator, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))
                .toDouble()
        }

        return rate.coerceIn(0.0, 100.0)
    }
}
