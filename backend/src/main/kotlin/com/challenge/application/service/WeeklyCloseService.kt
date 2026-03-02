package com.challenge.application.service

import com.challenge.application.dto.*
import com.challenge.domain.entity.FeedEventType
import com.challenge.domain.entity.WeeklySnapshot
import com.challenge.domain.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID

@Service
class WeeklyCloseService(
    private val weeklySnapshotRepository: WeeklySnapshotRepository,
    private val challengeRepository: ChallengeRepository,
    private val teamRepository: TeamRepository,
    private val userGoalRepository: UserGoalRepository,
    private val goalTypeRepository: GoalTypeRepository,
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val feedEventService: FeedEventService,
    private val pushNotificationService: PushNotificationService
) {

    @Transactional
    fun closeWeek(request: CloseWeekRequest): List<WeeklyResultResponse> {
        val challengeId = UUID.fromString(request.challengeId)
        val weekNumber = request.weekNumber

        val challenge = challengeRepository.findById(challengeId)
            .orElseThrow { IllegalArgumentException("챌린지를 찾을 수 없습니다") }

        // 1. 중복 마감 방지
        val existing = weeklySnapshotRepository.findByChallengeIdAndWeekNumber(challengeId, weekNumber)
        if (existing.isNotEmpty()) {
            throw IllegalStateException("이미 ${weekNumber}주차가 마감되었습니다")
        }

        // 2. 챌린지의 모든 팀 조회
        val teams = teamRepository.findByChallengeId(challengeId)
        if (teams.isEmpty()) {
            throw IllegalStateException("챌린지에 등록된 팀이 없습니다")
        }

        // 3. 팀별 멤버 달성률 계산
        data class TeamMemberData(
            val teamId: UUID,
            val teamName: String,
            val userId: UUID,
            val achievementRate: BigDecimal
        )

        val allMemberData = mutableListOf<TeamMemberData>()

        for (team in teams) {
            val members = mutableListOf(team.member1)
            team.member2?.let { members.add(it) }

            for (member in members) {
                val rate = calculateUserAchievementRate(member.id!!, challengeId)
                allMemberData.add(
                    TeamMemberData(
                        teamId = team.id!!,
                        teamName = team.name,
                        userId = member.id!!,
                        achievementRate = rate
                    )
                )
            }
        }

        // 4. 팀 점수 계산 (팀원 평균 달성률)
        val teamScores = allMemberData
            .groupBy { it.teamId }
            .map { (teamId, members) ->
                val avgScore = members
                    .map { it.achievementRate }
                    .fold(BigDecimal.ZERO) { acc, rate -> acc.add(rate) }
                    .divide(BigDecimal(members.size), 2, RoundingMode.HALF_UP)
                teamId to avgScore
            }
            .toMap()

        // 5. 팀 순위 (점수 내림차순)
        val sortedTeams = teamScores.entries.sortedByDescending { it.value }
        val teamRanks = mutableMapOf<UUID, Int>()
        sortedTeams.forEachIndexed { index, entry ->
            teamRanks[entry.key] = index + 1
        }

        // 6. 하위 2팀 마킹
        val bottomTeamIds = sortedTeams
            .takeLast(minOf(2, sortedTeams.size))
            .map { it.key }
            .toSet()

        // 7. WeeklySnapshot 저장
        val snapshots = allMemberData.map { data ->
            val team = teams.first { it.id == data.teamId }
            val user = if (team.member1.id == data.userId) team.member1 else team.member2!!

            WeeklySnapshot(
                challenge = challenge,
                weekNumber = weekNumber,
                user = user,
                team = team,
                achievementRate = data.achievementRate,
                teamScore = teamScores[data.teamId] ?: BigDecimal.ZERO,
                teamRank = teamRanks[data.teamId] ?: 0,
                isBottomTeam = data.teamId in bottomTeamIds
            )
        }
        weeklySnapshotRepository.saveAll(snapshots)

        // 8. 피드 이벤트 + 푸시 알림
        val processedTeams = mutableSetOf<UUID>()
        for (snapshot in snapshots) {
            if (snapshot.team.id!! in processedTeams) continue
            processedTeams.add(snapshot.team.id!!)

            feedEventService.publishEvent(
                challengeId = challengeId,
                user = snapshot.user,
                eventType = FeedEventType.WEEKLY_ACHIEVEMENT,
                referenceId = snapshot.id!!,
                title = "${snapshot.team.name} ${weekNumber}주차 결과",
                description = "팀 점수 ${snapshot.teamScore}점, ${snapshot.teamRank}위",
                imageUrl = null
            )
        }

        val allUserIds = snapshots.map { it.user.id!! }.distinct()
        pushNotificationService.sendToUsers(
            userIds = allUserIds,
            title = "${weekNumber}주차 마감 완료",
            body = "주간 결과가 발표되었습니다!",
            url = "/result"
        )

        // 9. 챌린지 currentWeek 업데이트
        challenge.currentWeek = weekNumber + 1
        challengeRepository.save(challenge)

        return buildWeeklyResults(snapshots)
    }

    @Transactional(readOnly = true)
    fun getWeeklyResults(challengeId: String, weekNumber: Int): List<WeeklyResultResponse> {
        val challengeUuid = UUID.fromString(challengeId)
        val snapshots = weeklySnapshotRepository.findByChallengeIdAndWeekNumber(challengeUuid, weekNumber)
        if (snapshots.isEmpty()) {
            throw IllegalArgumentException("해당 주차의 결과가 없습니다")
        }
        return buildWeeklyResults(snapshots)
    }

    @Transactional(readOnly = true)
    fun getUserWeeklyResults(challengeId: String, userId: String): List<UserWeeklyResultResponse> {
        val challengeUuid = UUID.fromString(challengeId)
        val userUuid = UUID.fromString(userId)
        val snapshots = weeklySnapshotRepository.findByChallengeIdAndUserId(challengeUuid, userUuid)

        return snapshots
            .sortedBy { it.weekNumber }
            .map { snapshot ->
                UserWeeklyResultResponse(
                    weekNumber = snapshot.weekNumber,
                    achievementRate = snapshot.achievementRate,
                    teamScore = snapshot.teamScore,
                    teamRank = snapshot.teamRank,
                    isBottomTeam = snapshot.isBottomTeam
                )
            }
    }

    private fun calculateUserAchievementRate(userId: UUID, challengeId: UUID): BigDecimal {
        val goals = userGoalRepository.findByUserIdAndChallengeId(userId, challengeId)
        if (goals.isEmpty()) return BigDecimal.ZERO

        val latestRecord = inBodyRecordRepository
            .findFirstByUserIdAndChallengeIdOrderByRecordDateDesc(userId, challengeId)
            ?: return BigDecimal.ZERO

        val rates = goals.mapNotNull { goal ->
            val goalType = goalTypeRepository.findById(goal.goalTypeId).orElse(null) ?: return@mapNotNull null

            val currentValue = when (goalType.name) {
                "체중 감량" -> latestRecord.weight
                "근육량 증가" -> latestRecord.skeletalMuscleMass
                "체지방률 감소" -> latestRecord.bodyFatPercentage
                else -> return@mapNotNull null
            }

            calculateRate(
                directionIsDecrease = goalType.directionIsDecrease,
                startValue = goal.startValue,
                targetValue = goal.targetValue,
                currentValue = currentValue
            )
        }

        if (rates.isEmpty()) return BigDecimal.ZERO

        return rates
            .fold(BigDecimal.ZERO) { acc, rate -> acc.add(rate) }
            .divide(BigDecimal(rates.size), 2, RoundingMode.HALF_UP)
    }

    private fun calculateRate(
        directionIsDecrease: Boolean,
        startValue: BigDecimal,
        targetValue: BigDecimal,
        currentValue: BigDecimal
    ): BigDecimal {
        val rate = if (directionIsDecrease) {
            val denominator = startValue.subtract(targetValue)
            if (denominator.compareTo(BigDecimal.ZERO) == 0) BigDecimal(100)
            else startValue.subtract(currentValue)
                .divide(denominator, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))
        } else {
            val denominator = targetValue.subtract(startValue)
            if (denominator.compareTo(BigDecimal.ZERO) == 0) BigDecimal(100)
            else currentValue.subtract(startValue)
                .divide(denominator, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))
        }

        return rate.coerceIn(BigDecimal.ZERO, BigDecimal(100)).setScale(2, RoundingMode.HALF_UP)
    }

    private fun buildWeeklyResults(snapshots: List<WeeklySnapshot>): List<WeeklyResultResponse> {
        return snapshots
            .groupBy { it.team.id }
            .map { (_, teamSnapshots) ->
                val first = teamSnapshots.first()
                WeeklyResultResponse(
                    teamName = first.team.name,
                    teamScore = first.teamScore,
                    teamRank = first.teamRank,
                    isBottomTeam = first.isBottomTeam,
                    members = teamSnapshots.map { snapshot ->
                        MemberResult(
                            nickname = snapshot.user.nickname,
                            achievementRate = snapshot.achievementRate
                        )
                    }
                )
            }
            .sortedBy { it.teamRank }
    }
}
