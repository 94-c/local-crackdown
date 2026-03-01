package com.challenge.infrastructure.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestClient

@Service
class KakaoOAuthService(
    @Value("\${kakao.client-id}") private val clientId: String
) {

    private val restClient = RestClient.create()

    data class KakaoTokenResponse(
        val access_token: String,
        val token_type: String? = null,
        val refresh_token: String? = null,
        val expires_in: Long? = null,
        val scope: String? = null
    )

    data class KakaoProfile(
        val nickname: String? = null,
        val profile_image_url: String? = null
    )

    data class KakaoAccount(
        val email: String? = null,
        val profile: KakaoProfile? = null
    )

    data class KakaoUserResponse(
        val id: Long,
        val kakao_account: KakaoAccount? = null
    )

    data class KakaoUserInfo(
        val kakaoId: Long,
        val nickname: String,
        val email: String?,
        val profileImageUrl: String?
    )

    fun getAccessToken(code: String, redirectUri: String): String {
        val params = LinkedMultiValueMap<String, String>().apply {
            add("grant_type", "authorization_code")
            add("client_id", clientId)
            add("redirect_uri", redirectUri)
            add("code", code)
        }

        val response = restClient.post()
            .uri("https://kauth.kakao.com/oauth/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(params)
            .retrieve()
            .body(KakaoTokenResponse::class.java)
            ?: throw IllegalStateException("Failed to get Kakao access token")

        return response.access_token
    }

    fun getUserInfo(accessToken: String): KakaoUserInfo {
        val response = restClient.get()
            .uri("https://kapi.kakao.com/v2/user/me")
            .header("Authorization", "Bearer $accessToken")
            .retrieve()
            .body(KakaoUserResponse::class.java)
            ?: throw IllegalStateException("Failed to get Kakao user info")

        return KakaoUserInfo(
            kakaoId = response.id,
            nickname = response.kakao_account?.profile?.nickname ?: "카카오유저",
            email = response.kakao_account?.email,
            profileImageUrl = response.kakao_account?.profile?.profile_image_url
        )
    }

    fun kakaoLogin(code: String, redirectUri: String): KakaoUserInfo {
        val accessToken = getAccessToken(code, redirectUri)
        return getUserInfo(accessToken)
    }
}
