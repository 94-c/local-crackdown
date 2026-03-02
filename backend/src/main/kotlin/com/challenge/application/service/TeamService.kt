package com.challenge.application.service

import com.challenge.application.dto.CreateTeamRequest
import com.challenge.application.dto.TeamResponse
import com.challenge.application.dto.UserResponse
import com.challenge.domain.entity.ParticipantStatus
import com.challenge.domain.entity.Team
import com.challenge.domain.entity.User
import com.challenge.domain.repository.ChallengeParticipantRepository
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
    private val userRepository: UserRepository,
    private val participantRepository: ChallengeParticipantRepository,
    private val notificationService: NotificationService,
    private val pushNotificationService: PushNotificationService
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
    fun autoAssignTeams(challengeId: UUID): List<TeamResponse> {
        val challenge = challengeRepository.findById(challengeId)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val existingTeams = teamRepository.findByChallengeId(challengeId)
        val assignedUserIds = existingTeams.flatMap { team ->
            listOfNotNull(team.member1.id, team.member2?.id)
        }.toSet()

        val approved = participantRepository.findByChallengeIdAndStatus(challengeId, ParticipantStatus.APPROVED)
        val unassigned = approved
            .filter { participant -> !assignedUserIds.contains(participant.userId) }
            .mapNotNull { participant -> userRepository.findById(participant.userId).orElse(null) }
            .shuffled()

        if (unassigned.isEmpty()) return emptyList()

        val newTeams = mutableListOf<TeamResponse>()
        val assignedMemberIds = mutableListOf<UUID>()
        val baseNumber = existingTeams.size + 1
        var teamIndex = 0

        for (chunk in unassigned.chunked(2)) {
            val team = Team(
                name = "${challenge.title} ${baseNumber + teamIndex}팀",
                challenge = challenge,
                member1 = chunk[0],
                member2 = if (chunk.size > 1) chunk[1] else null
            )
            newTeams.add(toResponse(teamRepository.save(team)))
            assignedMemberIds.addAll(chunk.mapNotNull { it.id })
            teamIndex++
        }

        for (memberId in assignedMemberIds) {
            notificationService.create(
                userId = memberId,
                title = "팀 배정 완료",
                message = "${challenge.title}의 팀이 배정되었습니다. 팀 페이지에서 확인하세요.",
                type = "TEAM_ASSIGNED",
                link = "/team"
            )
        }
        pushNotificationService.sendToUsers(
            assignedMemberIds,
            "팀 배정 완료",
            "${challenge.title}의 팀이 배정되었습니다.",
            "/team"
        )

        return newTeams
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
            role = user.role.name,
            gender = user.gender,
            birthDate = user.birthDate,
            height = user.height
        )
    }
}
