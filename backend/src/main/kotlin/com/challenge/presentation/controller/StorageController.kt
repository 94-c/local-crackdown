package com.challenge.presentation.controller

import com.challenge.infrastructure.storage.S3StorageService
import org.springframework.web.bind.annotation.*
import java.util.UUID

data class PresignedUrlRequest(
    val contentType: String = "image/jpeg",
    val folder: String = "verifications"
)

data class PresignedUrlResponse(
    val uploadUrl: String,
    val fileUrl: String,
    val key: String
)

@RestController
@RequestMapping("/api/storage")
class StorageController(
    private val s3StorageService: S3StorageService
) {

    @PostMapping("/presigned-url")
    fun getPresignedUrl(@RequestBody request: PresignedUrlRequest): PresignedUrlResponse {
        val key = "${request.folder}/${UUID.randomUUID()}"
        val uploadUrl = s3StorageService.generatePresignedUploadUrl(key, request.contentType)
        val fileUrl = s3StorageService.getFileUrl(key)
        return PresignedUrlResponse(uploadUrl = uploadUrl, fileUrl = fileUrl, key = key)
    }
}
