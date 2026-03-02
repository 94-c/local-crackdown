package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.TeamMission
import com.challenge.domain.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class TeamMissionService(
    private val teamMissionRepository: TeamMissionRepository,
    private val teamRepository: TeamRepository,
    private val challengeRepository: ChallengeRepository,
    private val missionTemplateRepository: MissionTemplateRepository,
    private val missionVerificationRepository: MissionVerificationRepository
) {

    @Transactional
    fun createMission(userId: String, request: CreateTeamMissionRequest): TeamMissionResponse {
        val userUuid = UUID.fromString(userId)
        val teamUuid = UUID.fromString(request.teamId)
        val challengeUuid = UUID.fromString(request.challengeId)
        val templateUuid = UUID.fromString(request.missionTemplateId)

        val team = teamRepository.findById(teamUuid)
            .orElseThrow { IllegalArgumentException("Team not found") }

        // Validate user belongs to team
        val isMember = team.member1.id == userUuid || team.member2?.id == userUuid
        if (!isMember) {
            throw IllegalArgumentException("User does not belong to this team")
        }

        val challenge = challengeRepository.findById(challengeUuid)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val missionTemplate = missionTemplateRepository.findById(templateUuid)
            .orElseThrow { IllegalArgumentException("Mission template not found") }

        val teamMission = TeamMission(
            team = team,
            challenge = challenge,
            weekNumber = request.weekNumber,
            missionTemplate = missionTemplate,
            targetValue = request.targetValue
        )
        val saved = teamMissionRepository.save(teamMission)
        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getMissionsByTeamAndChallenge(teamId: String, challengeId: String): List<TeamMissionResponse> {
        val teamUuid = UUID.fromString(teamId)
        val challengeUuid = UUID.fromString(challengeId)
        return teamMissionRepository.findByTeamIdAndChallengeId(teamUuid, challengeUuid)
            .map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getCurrentWeekMission(teamId: String, challengeId: String, weekNumber: Int): TeamMissionResponse? {
        val teamUuid = UUID.fromString(teamId)
        val challengeUuid = UUID.fromString(challengeId)
        return teamMissionRepository.findByTeamIdAndChallengeIdAndWeekNumber(teamUuid, challengeUuid, weekNumber)
            ?.let { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getMissionById(missionId: String): TeamMissionResponse {
        val missionUuid = UUID.fromString(missionId)
        val mission = teamMissionRepository.findById(missionUuid)
            .orElseThrow { IllegalArgumentException("Team mission not found") }
        return toResponse(mission)
    }

    @Transactional
    fun updateProgress(missionId: String, request: UpdateMissionProgressRequest): TeamMissionResponse {
        val missionUuid = UUID.fromString(missionId)
        val mission = teamMissionRepository.findById(missionUuid)
            .orElseThrow { IllegalArgumentException("Team mission not found") }

        mission.currentValue = request.currentValue
        if (mission.currentValue >= mission.targetValue) {
            mission.status = "COMPLETED"
        }

        val saved = teamMissionRepository.save(mission)
        return toResponse(saved)
    }

    @Transactional
    fun deleteMission(userId: String, missionId: String) {
        val userUuid = UUID.fromString(userId)
        val missionUuid = UUID.fromString(missionId)
        val mission = teamMissionRepository.findById(missionUuid)
            .orElseThrow { IllegalArgumentException("Team mission not found") }

        val team = mission.team
        val isMember = team.member1.id == userUuid || team.member2?.id == userUuid
        require(isMember) { "You can only delete missions from your own team" }

        // 관련 인증 기록 먼저 삭제
        missionVerificationRepository.deleteByTeamMissionId(missionUuid)
        teamMissionRepository.delete(mission)
    }

    private fun toResponse(mission: TeamMission): TeamMissionResponse {
        val verifications = missionVerificationRepository.findByTeamMissionId(mission.id!!)
            .map { v ->
                VerificationResponse(
                    id = v.id.toString(),
                    userNickname = v.user.nickname,
                    imageUrl = v.imageUrl,
                    memo = v.memo,
                    verified = v.verified,
                    createdAt = v.createdAt
                )
            }

        return TeamMissionResponse(
            id = mission.id.toString(),
            teamName = mission.team.name,
            weekNumber = mission.weekNumber,
            missionTemplateName = mission.missionTemplate.name,
            unit = mission.missionTemplate.unit,
            targetValue = mission.targetValue,
            currentValue = mission.currentValue,
            status = mission.status,
            verifications = verifications
        )
    }
}
