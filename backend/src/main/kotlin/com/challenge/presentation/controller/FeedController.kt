package com.challenge.presentation.controller

import com.challenge.application.dto.CheerToggleResponse
import com.challenge.application.dto.CreateFeedPostRequest
import com.challenge.application.dto.FeedEventResponse
import com.challenge.application.dto.FeedPageResponse
import com.challenge.application.dto.UpdateFeedPostRequest
import com.challenge.application.service.FeedCheerService
import com.challenge.application.service.FeedEventService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/feed")
class FeedController(
    private val feedEventService: FeedEventService,
    private val feedCheerService: FeedCheerService
) {

    @GetMapping
    fun getFeed(
        authentication: Authentication,
        @RequestParam challengeId: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): FeedPageResponse {
        val userId = authentication.principal as String
        return feedEventService.getFeed(challengeId, userId, page, size)
    }

    @PostMapping("/{feedEventId}/cheer")
    fun toggleCheer(
        authentication: Authentication,
        @PathVariable feedEventId: String
    ): CheerToggleResponse {
        val userId = authentication.principal as String
        return feedCheerService.toggleCheer(feedEventId, userId)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createPost(
        authentication: Authentication,
        @Valid @RequestBody request: CreateFeedPostRequest
    ): FeedEventResponse {
        val userId = authentication.principal as String
        return feedEventService.createPost(userId, request)
    }

    @PutMapping("/{id}")
    fun updatePost(
        authentication: Authentication,
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateFeedPostRequest
    ): FeedEventResponse {
        val userId = authentication.principal as String
        return feedEventService.updatePost(userId, id, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEvent(
        authentication: Authentication,
        @PathVariable id: String
    ) {
        val userId = authentication.principal as String
        feedEventService.deleteEvent(userId, id)
    }
}
