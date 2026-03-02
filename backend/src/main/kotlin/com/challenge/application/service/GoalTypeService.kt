package com.challenge.application.service

import com.challenge.application.dto.GoalTypeResponse
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.GoalTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class GoalTypeService(
    private val goalTypeRepository: GoalTypeRepository,
    private val challengeRepository: ChallengeRepository
) {

    @Transactional(readOnly = true)
    fun getGoalTypes(): List<GoalTypeResponse> {
        return goalTypeRepository.findAll().map {
            GoalTypeResponse(
                id = it.id.toString(),
                name = it.name,
                unit = it.unit,
                description = it.description,
                directionIsDecrease = it.directionIsDecrease
            )
        }
    }

    @Transactional(readOnly = true)
    fun getGoalTypesByChallenge(challengeId: String): List<GoalTypeResponse> {
        val challenge = challengeRepository.findById(UUID.fromString(challengeId))
            .orElseThrow { IllegalArgumentException("Challenge not found") }
        return challenge.goalTypes.map {
            GoalTypeResponse(it.id.toString(), it.name, it.unit, it.description, it.directionIsDecrease)
        }
    }
}
