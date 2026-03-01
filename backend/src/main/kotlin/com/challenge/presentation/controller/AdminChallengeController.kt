package com.challenge.presentation.controller

import com.challenge.application.dto.ChallengeDetailWithMembersResponse
import com.challenge.application.dto.ChallengeParticipantResponse
import com.challenge.application.dto.ChallengeResponse
import com.challenge.application.dto.CreateChallengeRequest
import com.challenge.application.dto.MemberDetailResponse
import com.challenge.application.dto.UpdateChallengeRequest
import com.challenge.application.service.ChallengeService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/admin/challenges")
class AdminChallengeController(
    private val challengeService: ChallengeService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createChallenge(@Valid @RequestBody request: CreateChallengeRequest): ChallengeResponse {
        return challengeService.createChallenge(request)
    }

    @GetMapping
    fun getChallenges(): List<ChallengeResponse> {
        return challengeService.getChallenges()
    }

    @GetMapping("/{id}")
    fun getChallenge(@PathVariable id: UUID): ChallengeResponse {
        return challengeService.getChallenge(id)
    }

    @PutMapping("/{id}")
    fun updateChallenge(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateChallengeRequest
    ): ChallengeResponse {
        return challengeService.updateChallenge(id, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteChallenge(@PathVariable id: UUID) {
        challengeService.deleteChallenge(id)
    }

    @GetMapping("/{id}/members")
    fun getChallengeMembers(@PathVariable id: UUID): ChallengeDetailWithMembersResponse {
        return challengeService.getChallengeWithMembers(id)
    }

    @GetMapping("/{id}/participants")
    fun getParticipants(@PathVariable id: UUID): List<ChallengeParticipantResponse> {
        return challengeService.getParticipants(id)
    }

    @GetMapping("/{challengeId}/members/{userId}/detail")
    fun getMemberDetail(
        @PathVariable challengeId: UUID,
        @PathVariable userId: UUID
    ): MemberDetailResponse {
        return challengeService.getMemberDetail(userId, challengeId)
    }
}
