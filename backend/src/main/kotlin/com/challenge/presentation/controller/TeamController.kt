package com.challenge.presentation.controller

import com.challenge.application.dto.TeamResponse
import com.challenge.application.service.TeamService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/teams")
class TeamController(
    private val teamService: TeamService
) {

    @GetMapping("/me")
    fun getMyTeams(authentication: Authentication): List<TeamResponse> {
        val userId = UUID.fromString(authentication.principal as String)
        return teamService.getMyTeams(userId)
    }
}
