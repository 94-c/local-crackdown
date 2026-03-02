package com.challenge.application.service

import com.challenge.application.dto.CreateVerificationRequest
import com.challenge.application.dto.VerificationResponse
import com.challenge.domain.entity.FeedEventType
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
    private val userRepository: UserRepository,
    private val feedEventService: FeedEventService,
    private val pushNotificationService: PushNotificationService
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
            imageUrl = request.imageUrl,
            memo = request.memo,
            verified = false
        )
        val saved = missionVerificationRepository.save(verification)

        // 피드 이벤트 생성
        feedEventService.publishEvent(
            challengeId = teamMission.challenge.id!!,
            user = user,
            eventType = FeedEventType.MISSION_VERIFICATION,
            referenceId = saved.id!!,
            title = "${user.nickname}님이 미션을 인증했습니다",
            description = request.memo,
            imageUrl = request.imageUrl
        )

        // 팀원에게 푸시 알림
        val team = teamMission.team
        val teammateId = if (team.member1.id == user.id) team.member2?.id else team.member1.id
        if (teammateId != null) {
            pushNotificationService.sendToUser(
                userId = teammateId,
                title = "팀원 미션 인증",
                body = "${user.nickname}님이 미션을 인증했습니다!",
                url = "/team"
            )
        }

        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getVerificationsByMission(missionId: String): List<VerificationResponse> {
        val missionUuid = UUID.fromString(missionId)
        return missionVerificationRepository.findByTeamMissionId(missionUuid)
            .map { toResponse(it) }
    }

    @Transactional
    fun approveVerification(verificationId: String) {
        val uuid = UUID.fromString(verificationId)
        val verification = missionVerificationRepository.findById(uuid)
            .orElseThrow { IllegalArgumentException("Verification not found") }
        verification.verified = true
        missionVerificationRepository.save(verification)
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
