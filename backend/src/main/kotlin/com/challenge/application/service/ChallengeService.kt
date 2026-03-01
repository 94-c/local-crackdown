package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.Challenge
import com.challenge.domain.entity.ChallengeStatus
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.InBodyRecordRepository
import com.challenge.domain.repository.TeamRepository
import com.challenge.domain.repository.UserGoalRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class ChallengeService(
    private val challengeRepository: ChallengeRepository,
    private val teamRepository: TeamRepository,
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val userGoalRepository: UserGoalRepository
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

    @Transactional(readOnly = true)
    fun getChallengeByInviteCode(code: String): ChallengeInviteResponse {
        val challenge = challengeRepository.findByInviteCode(code)
            ?: throw IllegalArgumentException("Challenge not found")
        return ChallengeInviteResponse(
            id = challenge.id.toString(),
            title = challenge.title,
            description = challenge.description,
            startDate = challenge.startDate,
            endDate = challenge.endDate,
            status = challenge.status.name
        )
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

    @Transactional(readOnly = true)
    fun getChallengeWithMembers(challengeId: UUID): ChallengeDetailWithMembersResponse {
        val challenge = challengeRepository.findById(challengeId)
            .orElseThrow { IllegalArgumentException("Challenge not found") }
        val teams = teamRepository.findByChallengeId(challengeId)

        val teamDetails = teams.map { team ->
            val members = listOfNotNull(team.member1, team.member2).map { user ->
                val hasInbody = inBodyRecordRepository.existsByUserIdAndChallengeId(user.id!!, challengeId)
                val lastRecord = inBodyRecordRepository.findFirstByUserIdAndChallengeIdOrderByRecordDateDesc(user.id!!, challengeId)
                val hasGoals = userGoalRepository.existsByUserIdAndChallengeId(user.id!!, challengeId)
                ChallengeMemberDetailResponse(
                    userId = user.id.toString(),
                    nickname = user.nickname,
                    email = user.email,
                    hasInbody = hasInbody,
                    lastInbodyDate = lastRecord?.recordDate,
                    hasGoals = hasGoals
                )
            }
            ChallengeTeamDetailResponse(
                teamId = team.id.toString(),
                teamName = team.name,
                members = members
            )
        }

        val totalMembers = teamDetails.sumOf { it.members.size }

        return ChallengeDetailWithMembersResponse(
            challenge = toResponse(challenge),
            teams = teamDetails,
            totalTeams = teams.size,
            totalMembers = totalMembers
        )
    }

    private fun toResponse(challenge: Challenge): ChallengeResponse {
        return ChallengeResponse(
            id = challenge.id.toString(),
            title = challenge.title,
            description = challenge.description,
            inviteCode = challenge.inviteCode,
            startDate = challenge.startDate,
            endDate = challenge.endDate,
            currentWeek = challenge.currentWeek,
            status = challenge.status.name,
            createdAt = challenge.createdAt
        )
    }
}
