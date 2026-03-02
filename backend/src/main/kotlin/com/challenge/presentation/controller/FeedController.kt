package com.challenge.presentation.controller

import com.challenge.application.dto.CheerToggleResponse
import com.challenge.application.dto.FeedPageResponse
import com.challenge.application.service.FeedCheerService
import com.challenge.application.service.FeedEventService
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
}
