package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.Challenge
import com.challenge.domain.entity.ChallengeParticipant
import com.challenge.domain.entity.ChallengeStatus
import com.challenge.domain.repository.ChallengeParticipantRepository
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.InBodyRecordRepository
import com.challenge.domain.repository.TeamRepository
import com.challenge.domain.repository.UserGoalRepository
import com.challenge.domain.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
class ChallengeService(
    private val challengeRepository: ChallengeRepository,
    private val teamRepository: TeamRepository,
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val userGoalRepository: UserGoalRepository,
    private val challengeParticipantRepository: ChallengeParticipantRepository,
    private val userRepository: UserRepository,
    private val inBodyService: InBodyService,
    private val userGoalService: UserGoalService
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

    @Transactional
    fun joinChallenge(userId: UUID, challengeId: UUID) {
        challengeRepository.findById(challengeId)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        if (challengeParticipantRepository.existsByChallengeIdAndUserId(challengeId, userId)) {
            return
        }

        val participant = ChallengeParticipant(
            challengeId = challengeId,
            userId = userId
        )
        challengeParticipantRepository.save(participant)
    }

    @Transactional(readOnly = true)
    fun getParticipants(challengeId: UUID): List<ChallengeParticipantResponse> {
        challengeRepository.findById(challengeId)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        val participants = challengeParticipantRepository.findByChallengeId(challengeId)
        val teams = teamRepository.findByChallengeId(challengeId)

        val teamMemberIds = teams.flatMap { team ->
            listOfNotNull(team.member1.id, team.member2?.id)
        }.toSet()

        return participants.map { participant ->
            val user = userRepository.findById(participant.userId)
                .orElseThrow { IllegalArgumentException("User not found") }
            val hasInbody = inBodyRecordRepository.existsByUserIdAndChallengeId(participant.userId, challengeId)
            val hasGoals = userGoalRepository.existsByUserIdAndChallengeId(participant.userId, challengeId)
            ChallengeParticipantResponse(
                userId = user.id.toString(),
                nickname = user.nickname,
                email = user.email,
                joinedAt = participant.joinedAt,
                hasTeam = teamMemberIds.contains(participant.userId),
                hasInbody = hasInbody,
                hasGoals = hasGoals
            )
        }
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

        val teamMemberIds = teams.flatMap { team ->
            listOfNotNull(team.member1.id, team.member2?.id)
        }.toSet()

        val participants = challengeParticipantRepository.findByChallengeId(challengeId)
        val unassignedParticipants = participants
            .filter { !teamMemberIds.contains(it.userId) }
            .map { participant ->
                val user = userRepository.findById(participant.userId)
                    .orElseThrow { IllegalArgumentException("User not found") }
                val hasInbody = inBodyRecordRepository.existsByUserIdAndChallengeId(participant.userId, challengeId)
                val hasGoals = userGoalRepository.existsByUserIdAndChallengeId(participant.userId, challengeId)
                ChallengeParticipantResponse(
                    userId = user.id.toString(),
                    nickname = user.nickname,
                    email = user.email,
                    joinedAt = participant.joinedAt,
                    hasTeam = false,
                    hasInbody = hasInbody,
                    hasGoals = hasGoals
                )
            }

        return ChallengeDetailWithMembersResponse(
            challenge = toResponse(challenge),
            teams = teamDetails,
            totalTeams = teams.size,
            totalMembers = totalMembers,
            unassignedParticipants = unassignedParticipants
        )
    }

    @Transactional(readOnly = true)
    fun getMemberDetail(userId: UUID, challengeId: UUID): MemberDetailResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        val inbodyRecords = inBodyService.getRecordsByUserAndChallenge(userId.toString(), challengeId.toString())
        val goals = userGoalService.getGoalsByUserAndChallenge(userId.toString(), challengeId.toString())
        val achievements = userGoalService.calculateAchievementRates(userId.toString(), challengeId.toString())

        return MemberDetailResponse(
            userId = user.id.toString(),
            nickname = user.nickname,
            email = user.email,
            gender = user.gender,
            birthDate = user.birthDate,
            height = user.height,
            inbodyRecords = inbodyRecords,
            goals = goals,
            achievements = achievements
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
