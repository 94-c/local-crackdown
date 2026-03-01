package com.challenge.application.service

import com.challenge.application.dto.InBodyRecordRequest
import com.challenge.application.dto.InBodyRecordResponse
import com.challenge.domain.entity.InBodyRecord
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.InBodyRecordRepository
import com.challenge.domain.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class InBodyService(
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val userRepository: UserRepository,
    private val challengeRepository: ChallengeRepository
) {

    @Transactional
    fun createRecord(userId: String, request: InBodyRecordRequest): InBodyRecordResponse {
        val userUuid = UUID.fromString(userId)
        val challengeUuid = UUID.fromString(request.challengeId)

        userRepository.findById(userUuid)
            .orElseThrow { IllegalArgumentException("User not found") }
        challengeRepository.findById(challengeUuid)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val record = InBodyRecord(
            userId = userUuid,
            challengeId = challengeUuid,
            weight = request.weight,
            skeletalMuscleMass = request.skeletalMuscleMass,
            bodyFatPercentage = request.bodyFatPercentage,
            recordDate = request.recordDate
        )
        val saved = inBodyRecordRepository.save(record)
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

    private fun toResponse(record: InBodyRecord): InBodyRecordResponse {
        return InBodyRecordResponse(
            id = record.id.toString(),
            userId = record.userId.toString(),
            challengeId = record.challengeId.toString(),
            weight = record.weight,
            skeletalMuscleMass = record.skeletalMuscleMass,
            bodyFatPercentage = record.bodyFatPercentage,
            recordDate = record.recordDate,
            createdAt = record.createdAt
        )
    }
}
