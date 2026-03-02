package com.challenge.infrastructure.storage

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.net.URI
import java.time.Duration

@Service
class S3StorageService(
    @Value("\${storage.s3.endpoint}") private val endpoint: String,
    @Value("\${storage.s3.region}") private val region: String,
    @Value("\${storage.s3.bucket}") private val bucket: String,
    @Value("\${storage.s3.access-key}") private val accessKey: String,
    @Value("\${storage.s3.secret-key}") private val secretKey: String
) {

    private val presigner: S3Presigner by lazy {
        S3Presigner.builder()
            .region(Region.of(region))
            .endpointOverride(URI.create(endpoint))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
                )
            )
            .build()
    }

    fun generatePresignedUploadUrl(key: String, contentType: String): String {
        val putRequest = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentType(contentType)
            .build()

        val presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(15))
            .putObjectRequest(putRequest)
            .build()

        return presigner.presignPutObject(presignRequest).url().toString()
    }

    fun getFileUrl(key: String): String {
        return "$endpoint/$bucket/$key"
    }
}
