package com.challenge.application.service

import com.challenge.application.dto.AssignPenaltyRequest
import com.challenge.application.dto.PenaltyMissionResponse
import com.challenge.application.dto.PenaltyVerificationResponse
import com.challenge.domain.entity.PenaltyMission
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.PenaltyMissionRepository
import com.challenge.domain.repository.PenaltyVerificationRepository
import com.challenge.domain.repository.TeamRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PenaltyMissionService(
    private val penaltyMissionRepository: PenaltyMissionRepository,
    private val penaltyVerificationRepository: PenaltyVerificationRepository,
    private val challengeRepository: ChallengeRepository,
    private val teamRepository: TeamRepository
) {

    @Transactional
    fun assignMission(request: AssignPenaltyRequest): PenaltyMissionResponse {
        val challengeUuid = UUID.fromString(request.challengeId)
        val teamUuid = UUID.fromString(request.teamId)

        val challenge = challengeRepository.findById(challengeUuid)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val team = teamRepository.findById(teamUuid)
            .orElseThrow { IllegalArgumentException("Team not found") }

        val penaltyMission = PenaltyMission(
            challenge = challenge,
            team = team,
            weekNumber = request.weekNumber,
            missionName = request.missionName,
            description = request.description
        )

        val saved = penaltyMissionRepository.save(penaltyMission)
        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getMissionsByWeek(challengeId: String, weekNumber: Int): List<PenaltyMissionResponse> {
        val challengeUuid = UUID.fromString(challengeId)
        return penaltyMissionRepository.findByChallengeIdAndWeekNumber(challengeUuid, weekNumber)
            .map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getMissionsByTeam(challengeId: String, teamId: String): List<PenaltyMissionResponse> {
        val challengeUuid = UUID.fromString(challengeId)
        val teamUuid = UUID.fromString(teamId)
        return penaltyMissionRepository.findByChallengeIdAndTeamId(challengeUuid, teamUuid)
            .map { toResponse(it) }
    }

    @Transactional
    fun updateStatus(missionId: String, status: String): PenaltyMissionResponse {
        val missionUuid = UUID.fromString(missionId)
        val mission = penaltyMissionRepository.findById(missionUuid)
            .orElseThrow { IllegalArgumentException("Penalty mission not found") }

        val validStatuses = listOf("ASSIGNED", "COMPLETED", "FAILED")
        if (status !in validStatuses) {
            throw IllegalArgumentException("Invalid status: $status. Must be one of $validStatuses")
        }

        mission.status = status
        val saved = penaltyMissionRepository.save(mission)
        return toResponse(saved)
    }

    private fun toResponse(mission: PenaltyMission): PenaltyMissionResponse {
        val verifications = penaltyVerificationRepository.findByPenaltyMissionId(mission.id!!)
            .map { v ->
                PenaltyVerificationResponse(
                    id = v.id.toString(),
                    userNickname = v.user.nickname,
                    memo = v.memo,
                    imageUrl = v.imageUrl,
                    approved = v.approved,
                    createdAt = v.createdAt
                )
            }

        return PenaltyMissionResponse(
            id = mission.id.toString(),
            teamName = mission.team.name,
            weekNumber = mission.weekNumber,
            missionName = mission.missionName,
            description = mission.description,
            status = mission.status,
            verifications = verifications
        )
    }
}
