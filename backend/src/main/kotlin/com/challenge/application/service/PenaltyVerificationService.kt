package com.challenge.application.service

import com.challenge.application.dto.CreatePenaltyVerificationRequest
import com.challenge.application.dto.PenaltyVerificationResponse
import com.challenge.domain.entity.FeedEventType
import com.challenge.domain.entity.PenaltyVerification
import com.challenge.domain.repository.PenaltyMissionRepository
import com.challenge.domain.repository.PenaltyVerificationRepository
import com.challenge.domain.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PenaltyVerificationService(
    private val penaltyVerificationRepository: PenaltyVerificationRepository,
    private val penaltyMissionRepository: PenaltyMissionRepository,
    private val userRepository: UserRepository,
    private val feedEventService: FeedEventService
) {

    @Transactional
    fun createVerification(userId: String, request: CreatePenaltyVerificationRequest): PenaltyVerificationResponse {
        val userUuid = UUID.fromString(userId)
        val penaltyMissionUuid = UUID.fromString(request.penaltyMissionId)

        val user = userRepository.findById(userUuid)
            .orElseThrow { IllegalArgumentException("User not found") }

        val penaltyMission = penaltyMissionRepository.findById(penaltyMissionUuid)
            .orElseThrow { IllegalArgumentException("Penalty mission not found") }

        val verification = PenaltyVerification(
            penaltyMission = penaltyMission,
            user = user,
            memo = request.memo,
            imageUrl = "placeholder-image-url",
            approved = false
        )

        val saved = penaltyVerificationRepository.save(verification)

        // 피드 이벤트 생성
        feedEventService.publishEvent(
            challengeId = penaltyMission.challenge.id!!,
            user = user,
            eventType = FeedEventType.PENALTY_VERIFICATION,
            referenceId = saved.id!!,
            title = "${user.nickname}님이 벌칙 미션을 수행했습니다",
            description = request.memo,
            imageUrl = null
        )

        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getVerifications(penaltyMissionId: String): List<PenaltyVerificationResponse> {
        val missionUuid = UUID.fromString(penaltyMissionId)
        return penaltyVerificationRepository.findByPenaltyMissionId(missionUuid)
            .map { toResponse(it) }
    }

    @Transactional
    fun approveVerification(verificationId: String): PenaltyVerificationResponse {
        val verificationUuid = UUID.fromString(verificationId)
        val verification = penaltyVerificationRepository.findById(verificationUuid)
            .orElseThrow { IllegalArgumentException("Penalty verification not found") }

        verification.approved = true
        val saved = penaltyVerificationRepository.save(verification)
        return toResponse(saved)
    }

    private fun toResponse(verification: PenaltyVerification): PenaltyVerificationResponse {
        return PenaltyVerificationResponse(
            id = verification.id.toString(),
            userNickname = verification.user.nickname,
            memo = verification.memo,
            imageUrl = verification.imageUrl,
            approved = verification.approved,
            createdAt = verification.createdAt
        )
    }
}
