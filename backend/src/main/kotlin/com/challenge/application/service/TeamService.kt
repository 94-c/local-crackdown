package com.challenge.application.service

import com.challenge.application.dto.CreateTeamRequest
import com.challenge.application.dto.TeamResponse
import com.challenge.application.dto.UserResponse
import com.challenge.domain.entity.Team
import com.challenge.domain.entity.User
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.TeamRepository
import com.challenge.domain.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class TeamService(
    private val teamRepository: TeamRepository,
    private val challengeRepository: ChallengeRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun createTeam(request: CreateTeamRequest): TeamResponse {
        val challenge = challengeRepository.findById(request.challengeId)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val member1 = userRepository.findById(request.member1Id)
            .orElseThrow { IllegalArgumentException("Member1 not found") }

        val member2 = request.member2Id?.let {
            userRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Member2 not found") }
        }

        val team = Team(
            name = request.name,
            challenge = challenge,
            member1 = member1,
            member2 = member2
        )
        val saved = teamRepository.save(team)
        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getTeamsByChallenge(challengeId: UUID): List<TeamResponse> {
        return teamRepository.findByChallengeId(challengeId).map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getMyTeams(userId: UUID): List<TeamResponse> {
        return teamRepository.findByMember1IdOrMember2Id(userId, userId).map { toResponse(it) }
    }

    @Transactional
    fun deleteTeam(id: UUID) {
        val team = teamRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Team not found") }
        teamRepository.delete(team)
    }

    private fun toResponse(team: Team): TeamResponse {
        return TeamResponse(
            id = team.id.toString(),
            name = team.name,
            challengeId = team.challenge.id.toString(),
            member1 = toUserResponse(team.member1),
            member2 = team.member2?.let { toUserResponse(it) },
            createdAt = team.createdAt
        )
    }

    private fun toUserResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id.toString(),
            email = user.email,
            nickname = user.nickname,
            profileImageUrl = user.profileImageUrl,
            role = user.role.name
        )
    }
}
