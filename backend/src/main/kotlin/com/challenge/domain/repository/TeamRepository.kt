package com.challenge.domain.repository

import com.challenge.domain.entity.Team
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TeamRepository : JpaRepository<Team, UUID> {
    fun findByChallengeId(challengeId: UUID): List<Team>
    fun findByMember1IdOrMember2Id(userId: UUID, userId2: UUID): List<Team>
}
