package com.challenge.application.service

import com.challenge.application.dto.NotificationCountResponse
import com.challenge.application.dto.NotificationResponse
import com.challenge.application.dto.ReminderResult
import com.challenge.domain.entity.Notification
import com.challenge.domain.repository.ChallengeRepository
import com.challenge.domain.repository.InBodyRecordRepository
import com.challenge.domain.repository.NotificationRepository
import com.challenge.domain.repository.TeamRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val teamRepository: TeamRepository,
    private val inBodyRecordRepository: InBodyRecordRepository,
    private val challengeRepository: ChallengeRepository
) {

    @Transactional
    fun create(userId: UUID, title: String, message: String, type: String, link: String? = null) {
        val notification = Notification(
            userId = userId,
            title = title,
            message = message,
            type = type,
            link = link
        )
        notificationRepository.save(notification)
    }

    @Transactional
    fun sendReminders(challengeId: UUID): ReminderResult {
        val challenge = challengeRepository.findById(challengeId)
            .orElseThrow { IllegalArgumentException("Challenge not found") }
        val teams = teamRepository.findByChallengeId(challengeId)
        val sinceDate = LocalDate.now().minusDays(challenge.inbodyFrequencyDays.toLong())

        val memberIds = teams.flatMap { team ->
            listOfNotNull(team.member1.id, team.member2?.id)
        }.distinct()

        var sentCount = 0
        for (userId in memberIds) {
            val hasRecord = inBodyRecordRepository
                .existsByUserIdAndChallengeIdAndRecordDateGreaterThanEqual(userId, challengeId, sinceDate)
            if (!hasRecord) {
                create(
                    userId = userId,
                    title = "인바디 기록 알림",
                    message = "인바디 기록을 입력해주세요. (${challenge.inbodyFrequencyDays}일마다 등록)",
                    type = "REMINDER",
                    link = "/profile"
                )
                sentCount++
            }
        }

        return ReminderResult(sentCount = sentCount)
    }

    @Transactional(readOnly = true)
    fun getNotifications(userId: UUID): List<NotificationResponse> {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).map { toResponse(it) }
    }

    @Transactional(readOnly = true)
    fun getUnreadCount(userId: UUID): NotificationCountResponse {
        val count = notificationRepository.countByUserIdAndIsReadFalse(userId)
        return NotificationCountResponse(unreadCount = count)
    }

    @Transactional
    fun markAsRead(notificationId: UUID, userId: UUID) {
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { IllegalArgumentException("Notification not found") }
        require(notification.userId == userId) { "Not your notification" }
        notification.isRead = true
        notificationRepository.save(notification)
    }

    @Transactional
    fun markAllAsRead(userId: UUID) {
        val notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
        notifications.filter { !it.isRead }.forEach {
            it.isRead = true
            notificationRepository.save(it)
        }
    }

    private fun toResponse(notification: Notification): NotificationResponse {
        return NotificationResponse(
            id = notification.id.toString(),
            title = notification.title,
            message = notification.message,
            type = notification.type,
            isRead = notification.isRead,
            link = notification.link,
            createdAt = notification.createdAt
        )
    }
}
