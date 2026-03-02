package com.challenge.application.service

import com.challenge.application.dto.InBodyRecordRequest
import com.challenge.application.dto.InBodyRecordResponse
import com.challenge.domain.entity.FeedEventType
import com.challenge.domain.entity.InBodyRecord
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.InBodyRecordRepository
import com.challenge.domain.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID

@Service
class InBodyService(
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val userRepository: UserRepository,
    private val challengeRepository: ChallengeRepository,
    private val feedEventService: FeedEventService
) {

    @Transactional
    fun createRecord(userId: String, request: InBodyRecordRequest): InBodyRecordResponse {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(request.challengeId)

        val user = userRepository.findById(userUuid)
            .orElseThrow { IllegalArgumentException("User not found") }
        challengeRepository.findById(challengeUuid)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        require(request.skeletalMuscleMass + request.bodyFatMass <= request.weight) {
            "Skeletal muscle mass + body fat mass cannot exceed weight"
        }

        val bodyFatPercentage = request.bodyFatMass
            .divide(request.weight, 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal(100))
            .setScale(2, RoundingMode.HALF_UP)

        val record = InBodyRecord(
            userId = userUuid,
            challengeId = challengeUuid,
            weight = request.weight,
            skeletalMuscleMass = request.skeletalMuscleMass,
            bodyFatPercentage = bodyFatPercentage,
            bodyFatMass = request.bodyFatMass,
            recordDate = request.recordDate
        )
        val saved = inBodyRecordRepository.save(record)

        // 피드 이벤트 생성
        feedEventService.publishEvent(
            challengeId = challengeUuid,
            user = user,
            eventType = FeedEventType.INBODY_RECORD,
            referenceId = saved.id!!,
            title = "${user.nickname}님이 인바디를 기록했습니다",
            description = "체중 ${saved.weight}kg, 골격근량 ${saved.skeletalMuscleMass}kg",
            imageUrl = null
        )

        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getRecordsByUserAndChallenge(userId: String, challengeId: String): List<InBodyRecordResponse> {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(challengeId)
        return inBodyRecordRepository
            .findByUserIdAndChallengeIdOrderByRecordDateDesc(userUuid, challengeUuid)
            .map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getLatestRecord(userId: String, challengeId: String): InBodyRecordResponse? {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(challengeId)
        return inBodyRecordRepository
            .findFirstByUserIdAndChallengeIdOrderByRecordDateDesc(userUuid, challengeUuid)
            ?.let { toResponse(it) }
    }

    @Transactional
    fun deleteRecord(userId: String, recordId: String) {
        val userUuid = UUID.fromString(userId)
        val recordUuid = UUID.fromString(recordId)
        val record = inBodyRecordRepository.findById(recordUuid)
            .orElseThrow { IllegalArgumentException("Record not found") }
        require(record.userId == userUuid) { "You can only delete your own records" }
        inBodyRecordRepository.delete(record)
    }

    private fun toResponse(record: InBodyRecord): InBodyRecordResponse {
        return InBodyRecordResponse(
            id = record.id.toString(),
            userId = record.userId.toString(),
            challengeId = record.challengeId.toString(),
            weight = record.weight,
            skeletalMuscleMass = record.skeletalMuscleMass,
            bodyFatPercentage = record.bodyFatPercentage,
            bodyFatMass = record.bodyFatMass,
            recordDate = record.recordDate,
            createdAt = record.createdAt
        )
    }
}
