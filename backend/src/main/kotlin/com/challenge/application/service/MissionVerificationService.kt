package com.challenge.application.service

import com.challenge.application.dto.CreateVerificationRequest
import com.challenge.application.dto.VerificationResponse
import com.challenge.domain.entity.MissionVerification
import com.challenge.domain.repository.MissionVerificationRepository
import com.challenge.domain.repository.TeamMissionRepository
import com.challenge.domain.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class MissionVerificationService(
    private val missionVerificationRepository: MissionVerificationRepository,
    private val teamMissionRepository: TeamMissionRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun createVerification(userId: String, request: CreateVerificationRequest): VerificationResponse {
        val userUuid = UUID.fromString(userId)
        val teamMissionUuid = UUID.fromString(request.teamMissionId)

        val user = userRepository.findById(userUuid)
            .orElseThrow { IllegalArgumentException("User not found") }

        val teamMission = teamMissionRepository.findById(teamMissionUuid)
            .orElseThrow { IllegalArgumentException("Team mission not found") }

        val verification = MissionVerification(
            teamMission = teamMission,
            user = user,
            imageUrl = "placeholder-image-url",
            memo = request.memo,
            verified = false
        )
        val saved = missionVerificationRepository.save(verification)
        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getVerificationsByMission(missionId: String): List<VerificationResponse> {
        val missionUuid = UUID.fromString(missionId)
        return missionVerificationRepository.findByTeamMissionId(missionUuid)
            .map { toResponse(it) }
    }

    private fun toResponse(verification: MissionVerification): VerificationResponse {
        return VerificationResponse(
            id = verification.id.toString(),
            userNickname = verification.user.nickname,
            imageUrl = verification.imageUrl,
            memo = verification.memo,
            verified = verification.verified,
            createdAt = verification.createdAt
        )
    }
}
