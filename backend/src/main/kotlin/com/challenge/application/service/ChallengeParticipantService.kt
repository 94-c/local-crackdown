package com.challenge.application.service

import com.challenge.application.dto.ParticipantResponse
import com.challenge.application.dto.ParticipantStatusResponse
import com.challenge.domain.entity.ChallengeParticipant
import com.challenge.domain.entity.ParticipantStatus
import com.challenge.domain.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ChallengeParticipantService(
    private val participantRepository: ChallengeParticipantRepository,
    private val challengeRepository: ChallengeRepository,
    private val userRepository: UserRepository,
    private val teamRepository: TeamRepository,
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val userGoalRepository: UserGoalRepository,
    private val notificationService: NotificationService
) {

    @Transactional
    fun joinChallenge(challengeId: UUID, userId: UUID): ParticipantStatusResponse {
        challengeRepository.findById(challengeId)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val existing = participantRepository.findByChallengeIdAndUserId(challengeId, userId)
        if (existing != null) {
            return ParticipantStatusResponse(status = existing.status.name)
        }

        val participant = ChallengeParticipant(
            challengeId = challengeId,
            userId = userId,
            status = ParticipantStatus.PENDING
        )
        val saved = participantRepository.save(participant)
        return ParticipantStatusResponse(status = saved.status.name)
    }

    @Transactional(readOnly = true)
    fun getMyStatus(challengeId: UUID, userId: UUID): ParticipantStatusResponse {
        val participant = participantRepository.findByChallengeIdAndUserId(challengeId, userId)
            ?: return ParticipantStatusResponse(status = "NONE")
        return ParticipantStatusResponse(status = participant.status.name)
    }

    @Transactional(readOnly = true)
    fun getParticipants(challengeId: UUID, status: ParticipantStatus?): List<ParticipantResponse> {
        val participants = if (status != null) {
            participantRepository.findByChallengeIdAndStatus(challengeId, status)
        } else {
            participantRepository.findByChallengeId(challengeId)
        }

        return participants.map { p ->
            val user = userRepository.findById(p.userId).orElse(null) ?: return@map null
            val hasTeam = teamRepository.findByMember1IdOrMember2Id(p.userId, p.userId).any {
                it.challenge.id == challengeId
            }
            val hasInbody = inBodyRecordRepository.existsByUserIdAndChallengeId(p.userId, challengeId)
            val hasGoals = userGoalRepository.existsByUserIdAndChallengeId(p.userId, challengeId)

            ParticipantResponse(
                id = p.id.toString(),
                userId = p.userId.toString(),
                nickname = user.nickname,
                email = user.email,
                status = p.status.name,
                joinedAt = p.joinedAt,
                hasTeam = hasTeam,
                hasInbody = hasInbody,
                hasGoals = hasGoals
            )
        }.filterNotNull()
    }

    @Transactional
    fun approveParticipant(participantId: UUID) {
        val participant = participantRepository.findById(participantId)
            .orElseThrow { IllegalArgumentException("Participant not found") }
        participant.status = ParticipantStatus.APPROVED
        participantRepository.save(participant)

        notificationService.create(
            userId = participant.userId,
            title = "참가 승인",
            message = "챌린지 참가가 승인되었습니다. 온보딩을 진행해주세요.",
            type = "PARTICIPANT_APPROVED",
            link = "/onboarding"
        )
    }

    @Transactional
    fun rejectParticipant(participantId: UUID) {
        val participant = participantRepository.findById(participantId)
            .orElseThrow { IllegalArgumentException("Participant not found") }
        participant.status = ParticipantStatus.REJECTED
        participantRepository.save(participant)

        notificationService.create(
            userId = participant.userId,
            title = "참가 거절",
            message = "챌린지 참가가 거절되었습니다.",
            type = "PARTICIPANT_REJECTED"
        )
    }

    @Transactional
    fun approveAll(challengeId: UUID) {
        val pending = participantRepository.findByChallengeIdAndStatus(challengeId, ParticipantStatus.PENDING)
        pending.forEach { p ->
            p.status = ParticipantStatus.APPROVED
            participantRepository.save(p)
            notificationService.create(
                userId = p.userId,
                title = "참가 승인",
                message = "챌린지 참가가 승인되었습니다. 온보딩을 진행해주세요.",
                type = "PARTICIPANT_APPROVED",
                link = "/onboarding"
            )
        }
    }
}
