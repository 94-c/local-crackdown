package com.challenge.presentation.controller

import com.challenge.application.dto.MissionTemplateResponse
import com.challenge.application.service.MissionTemplateService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/mission-templates")
class MissionTemplateController(
    private val missionTemplateService: MissionTemplateService
) {

    @GetMapping
    fun getAll(): List<MissionTemplateResponse> {
        return missionTemplateService.getAll()
    }
}
