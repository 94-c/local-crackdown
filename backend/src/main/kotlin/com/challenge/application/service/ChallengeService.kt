package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.Challenge
import com.challenge.domain.entity.ChallengeStatus
import com.challenge.domain.repository.*
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
    private val teamMissionRepository: TeamMissionRepository,
    private val missionVerificationRepository: MissionVerificationRepository,
    private val weeklySnapshotRepository: WeeklySnapshotRepository,
    private val penaltyMissionRepository: PenaltyMissionRepository,
    private val penaltyVerificationRepository: PenaltyVerificationRepository,
    private val finalScoreRepository: FinalScoreRepository,
    private val challengeParticipantRepository: ChallengeParticipantRepository,
    private val goalTypeRepository: GoalTypeRepository
) {

    @Transactional
    fun createChallenge(request: CreateChallengeRequest): ChallengeResponse {
        val endDate = request.startDate.plusDays(request.durationDays.toLong())

        val challenge = Challenge(
            title = request.title,
            description = request.description,
            startDate = request.startDate,
            endDate = endDate,
            durationDays = request.durationDays,
            inbodyFrequencyDays = request.inbodyFrequencyDays
        )

        if (request.goalTypeIds.isNotEmpty()) {
            val goalTypes = goalTypeRepository.findAllById(request.goalTypeIds.map { UUID.fromString(it) })
            challenge.goalTypes.addAll(goalTypes)
        }

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
            durationDays = challenge.durationDays,
            inbodyFrequencyDays = challenge.inbodyFrequencyDays,
            status = challenge.status.name
        )
    }

    @Transactional
    fun updateChallenge(id: UUID, request: UpdateChallengeRequest): ChallengeResponse {
        val challenge = challengeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        request.title?.let { challenge.title = it }
        request.description?.let { challenge.description = it }
        request.startDate?.let {
            challenge.startDate = it
            challenge.endDate = it.plusDays(challenge.durationDays.toLong())
        }
        request.durationDays?.let {
            challenge.durationDays = it
            challenge.endDate = challenge.startDate.plusDays(it.toLong())
        }
        request.inbodyFrequencyDays?.let { challenge.inbodyFrequencyDays = it }
        request.status?.let { challenge.status = ChallengeStatus.valueOf(it) }
        request.goalTypeIds?.let { ids ->
            challenge.goalTypes.clear()
            if (ids.isNotEmpty()) {
                val goalTypes = goalTypeRepository.findAllById(ids.map { UUID.fromString(it) })
                challenge.goalTypes.addAll(goalTypes)
            }
        }
        challenge.updatedAt = LocalDateTime.now()

        val saved = challengeRepository.save(challenge)
        return toResponse(saved)
    }

    @Transactional
    fun deleteChallenge(id: UUID) {
        val challenge = challengeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        // Delete in correct order due to FK constraints
        val teams = teamRepository.findByChallengeId(id)
        teams.forEach { team ->
            val teamMissions = teamMissionRepository.findByTeamIdAndChallengeId(team.id!!, id)
            teamMissions.forEach { mission ->
                missionVerificationRepository.deleteByTeamMissionId(mission.id!!)
            }
            teamMissionRepository.deleteByTeamIdAndChallengeId(team.id!!, id)

            val penalties = penaltyMissionRepository.findByChallengeIdAndTeamId(id, team.id!!)
            penalties.forEach { penalty ->
                penaltyVerificationRepository.deleteByPenaltyMissionId(penalty.id!!)
            }
            penaltyMissionRepository.deleteByChallengeIdAndTeamId(id, team.id!!)
        }

        weeklySnapshotRepository.deleteByChallengeId(id)
        finalScoreRepository.deleteByChallengeId(id)

        // Delete goals and inbody records
        userGoalRepository.deleteByChallengeId(id)
        inBodyRecordRepository.deleteByChallengeId(id)

        // Delete participants
        challengeParticipantRepository.deleteByChallengeId(id)

        // Delete teams
        teamRepository.deleteByChallengeId(id)

        // Finally delete challenge
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
            durationDays = challenge.durationDays,
            inbodyFrequencyDays = challenge.inbodyFrequencyDays,
            currentWeek = challenge.currentWeek,
            status = challenge.status.name,
            goalTypes = challenge.goalTypes.map { GoalTypeResponse(it.id.toString(), it.name, it.unit, it.description, it.directionIsDecrease) },
            createdAt = challenge.createdAt
        )
    }
}
