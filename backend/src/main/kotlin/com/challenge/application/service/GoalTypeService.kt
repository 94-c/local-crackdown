package com.challenge.application.service

import com.challenge.application.dto.GoalTypeResponse
import com.challenge.domain.repository.GoalTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class GoalTypeService(
    private val goalTypeRepository: GoalTypeRepository
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
}
