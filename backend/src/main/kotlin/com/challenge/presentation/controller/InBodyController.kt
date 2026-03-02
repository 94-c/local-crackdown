package com.challenge.presentation.controller

import com.challenge.application.dto.InBodyRecordRequest
import com.challenge.application.dto.InBodyRecordResponse
import com.challenge.application.service.InBodyService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/inbody")
class InBodyController(
    private val inBodyService: InBodyService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createRecord(
        authentication: Authentication,
        @Valid @RequestBody request: InBodyRecordRequest
    ): InBodyRecordResponse {
        val userId = authentication.principal as String
        return inBodyService.createRecord(userId, request)
    }

    @GetMapping
    fun getRecords(
        authentication: Authentication,
        @RequestParam challengeId: String
    ): List<InBodyRecordResponse> {
        val userId = authentication.principal as String
        return inBodyService.getRecordsByUserAndChallenge(userId, challengeId)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteRecord(
        authentication: Authentication,
        @PathVariable id: String
    ) {
        val userId = authentication.principal as String
        inBodyService.deleteRecord(userId, id)
    }
}
