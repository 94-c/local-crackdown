package com.challenge.presentation.controller

import com.challenge.application.dto.CreateTeamRequest
import com.challenge.application.dto.TeamResponse
import com.challenge.application.service.TeamService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/admin/teams")
class AdminTeamController(
    private val teamService: TeamService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createTeam(@Valid @RequestBody request: CreateTeamRequest): TeamResponse {
        return teamService.createTeam(request)
    }

    @GetMapping
    fun getTeamsByChallenge(@RequestParam challengeId: UUID): List<TeamResponse> {
        return teamService.getTeamsByChallenge(challengeId)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteTeam(@PathVariable id: UUID) {
        teamService.deleteTeam(id)
    }
}
