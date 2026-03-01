package com.challenge.application.service

import com.challenge.application.dto.ChallengeResponse
import com.challenge.application.dto.CreateChallengeRequest
import com.challenge.application.dto.UpdateChallengeRequest
import com.challenge.domain.entity.Challenge
import com.challenge.domain.entity.ChallengeStatus
import com.challenge.domain.repository.ChallengeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class ChallengeService(
    private val challengeRepository: ChallengeRepository
) {

    @Transactional
    fun createChallenge(request: CreateChallengeRequest): ChallengeResponse {
        require(request.endDate.isAfter(request.startDate)) {
            "End date must be after start date"
        }

        val challenge = Challenge(
            title = request.title,
            description = request.description,
            startDate = request.startDate,
            endDate = request.endDate
        )
        val saved = challengeRepository.save(challenge)
        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun getChallenges(): List<ChallengeResponse> {
        return challengeRepository.findAll().map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getChallenge(id: UUID): ChallengeResponse {
        val challenge = challengeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Challenge not found") }
        return toResponse(challenge)
    }

    @Transactional
    fun updateChallenge(id: UUID, request: UpdateChallengeRequest): ChallengeResponse {
        val challenge = challengeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        request.title?.let { challenge.title = it }
        request.description?.let { challenge.description = it }
        request.startDate?.let { challenge.startDate = it }
        request.endDate?.let { challenge.endDate = it }
        request.status?.let { challenge.status = ChallengeStatus.valueOf(it) }
        challenge.updatedAt = LocalDateTime.now()

        val saved = challengeRepository.save(challenge)
        return toResponse(saved)
    }

    @Transactional
    fun deleteChallenge(id: UUID) {
        val challenge = challengeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Challenge not found") }
        challengeRepository.delete(challenge)
    }

    private fun toResponse(challenge: Challenge): ChallengeResponse {
        return ChallengeResponse(
            id = challenge.id.toString(),
            title = challenge.title,
            description = challenge.description,
            startDate = challenge.startDate,
            endDate = challenge.endDate,
            currentWeek = challenge.currentWeek,
            status = challenge.status.name,
            createdAt = challenge.createdAt
        )
    }
}
