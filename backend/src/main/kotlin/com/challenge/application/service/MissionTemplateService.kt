package com.challenge.application.service

import com.challenge.application.dto.MissionTemplateResponse
import com.challenge.domain.repository.MissionTemplateRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class MissionTemplateService(
    private val missionTemplateRepository: MissionTemplateRepository
) {

    @Transactional(readOnly = true)
    fun getAll(): List<MissionTemplateResponse> {
        return missionTemplateRepository.findAll().map {
            MissionTemplateResponse(
                id = it.id.toString(),
                name = it.name,
                description = it.description,
                unit = it.unit
            )
        }
    }
}
