package com.challenge.presentation.controller

import com.challenge.application.dto.CreateTeamMissionRequest
import com.challenge.application.dto.TeamMissionResponse
import com.challenge.application.dto.UpdateMissionProgressRequest
import com.challenge.application.service.TeamMissionService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/team-missions")
class TeamMissionController(
    private val teamMissionService: TeamMissionService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createMission(
        authentication: Authentication,
        @Valid @RequestBody request: CreateTeamMissionRequest
    ): TeamMissionResponse {
        val userId = authentication.principal as String
        return teamMissionService.createMission(userId, request)
    }

    @GetMapping
    fun getMissions(
        @RequestParam teamId: String,
        @RequestParam challengeId: String
    ): List<TeamMissionResponse> {
        return teamMissionService.getMissionsByTeamAndChallenge(teamId, challengeId)
    }

    @GetMapping("/{id}")
    fun getMission(@PathVariable id: String): TeamMissionResponse {
        return teamMissionService.getMissionById(id)
    }

    @PutMapping("/{id}/progress")
    fun updateProgress(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateMissionProgressRequest
    ): TeamMissionResponse {
        return teamMissionService.updateProgress(id, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMission(
        authentication: Authentication,
        @PathVariable id: String
    ) {
        val userId = authentication.principal as String
        teamMissionService.deleteMission(userId, id)
    }
}
