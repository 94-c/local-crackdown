package com.challenge.application.service

import com.challenge.application.dto.FinalScoreResponse
import com.challenge.domain.entity.FinalScore
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.FinalScoreRepository
import com.challenge.domain.repository.TeamRepository
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.UUID

@Service
class FinalScoreService(
    private val finalScoreRepository: FinalScoreRepository,
    private val challengeRepository: ChallengeRepository,
    private val teamRepository: TeamRepository,
    private val entityManager: EntityManager
) {

    @Transactional
    fun calculateFinalScores(challengeId: String): List<FinalScoreResponse> {
        val challengeUuid = UUID.fromString(challengeId)

        val challenge = challengeRepository.findById(challengeUuid)
            .orElseThrow { IllegalArgumentException("Challenge not found") }

        // Delete existing final scores for this challenge
        finalScoreRepository.deleteByChallengeId(challengeUuid)
        entityManager.flush()

        // Sum all weekly team scores from weekly_snapshots grouped by team, then rank
        // weekly_snapshots table is from Sprint 4 (V7 migration)
        @Suppress("UNCHECKED_CAST")
        val results: List<Array<Any>> = try {
            entityManager.createNativeQuery(
                """
                SELECT ws.team_id, SUM(ws.team_score) as total
                FROM weekly_snapshots ws
                WHERE ws.challenge_id = :challengeId
                GROUP BY ws.team_id
                ORDER BY total DESC
                """.trimIndent()
            )
                .setParameter("challengeId", challengeUuid)
                .resultList as List<Array<Any>>
        } catch (_: Exception) {
            // If weekly_snapshots table doesn't exist yet (V7 not applied),
            // fall back to zero scores for all teams in this challenge
            emptyList()
        }

        val teams = teamRepository.findByChallengeId(challengeUuid)

        if (results.isEmpty()) {
            // Fallback: assign rank 1 to all teams with score 0
            val finalScores = teams.mapIndexed { index, team ->
                FinalScore(
                    challenge = challenge,
                    team = team,
                    totalScore = BigDecimal.ZERO,
                    finalRank = index + 1
                )
            }
            finalScoreRepository.saveAll(finalScores)
            return finalScores.map { toResponse(it) }
        }

        // Build map of teamId -> totalScore
        val scoreMap = mutableMapOf<UUID, BigDecimal>()
        for (row in results) {
            val teamId = row[0] as UUID
            val total = when (val rawTotal = row[1]) {
                is BigDecimal -> rawTotal
                is Number -> BigDecimal.valueOf(rawTotal.toDouble())
                else -> BigDecimal.ZERO
            }
            scoreMap[teamId] = total
        }

        // Include teams with no snapshots (score 0)
        for (team in teams) {
            if (team.id!! !in scoreMap) {
                scoreMap[team.id!!] = BigDecimal.ZERO
            }
        }

        // Sort by score descending and assign ranks
        val ranked = scoreMap.entries.sortedByDescending { it.value }
        val finalScores = ranked.mapIndexed { index, (teamId, totalScore) ->
            val team = teams.find { it.id == teamId }
                ?: teamRepository.findById(teamId)
                    .orElseThrow { IllegalArgumentException("Team not found: $teamId") }

            FinalScore(
                challenge = challenge,
                team = team,
                totalScore = totalScore,
                finalRank = index + 1
            )
        }

        finalScoreRepository.saveAll(finalScores)
        return finalScores.map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getFinalRankings(challengeId: String): List<FinalScoreResponse> {
        val challengeUuid = UUID.fromString(challengeId)
        return finalScoreRepository.findByChallengeIdOrderByFinalRankAsc(challengeUuid)
            .map { toResponse(it) }
    }

    private fun toResponse(finalScore: FinalScore): FinalScoreResponse {
        return FinalScoreResponse(
            teamName = finalScore.team.name,
            totalScore = finalScore.totalScore,
            finalRank = finalScore.finalRank
        )
    }
}
