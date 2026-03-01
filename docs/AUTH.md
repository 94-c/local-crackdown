# 인증 설계

## 개요

| 역할 | 인증 방식 | 설명 |
|------|----------|------|
| 일반 유저 | 카카오 OAuth2 | 초대 링크 → 카카오 로그인 → 자동 회원가입 |
| Admin | 이메일 + 비밀번호 | 별도 생성, 카카오 로그인 불가 |

## 유저 인증 플로우 (카카오)

```
1. 유저가 초대 링크 클릭
2. 프론트엔드 → 카카오 OAuth 인증 페이지 리다이렉트
3. 카카오 로그인 완료 → Authorization Code 발급
4. 프론트엔드 → 백엔드로 code 전달
5. 백엔드 → 카카오 API로 access_token 교환
6. 백엔드 → 카카오 사용자 정보 조회 (kakaoId, email, nickname, profileImage)
7. DB에 유저 존재 여부 확인
   - 없으면: 자동 회원가입 (User 생성)
   - 있으면: 기존 유저 조회
8. JWT 발급 → 프론트엔드 반환
```

## Admin 인증 플로우

```
1. Admin이 /admin/login 페이지 접속
2. 이메일 + 비밀번호 입력
3. 백엔드에서 검증 후 JWT 발급
4. JWT에 role=ADMIN claim 포함
```

## JWT 구조

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "USER | ADMIN",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## API 엔드포인트

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | /api/auth/kakao | No | 카카오 code로 로그인/회원가입 |
| POST | /api/auth/admin/login | No | Admin 이메일 로그인 |
| GET | /api/auth/me | JWT | 현재 유저 정보 |
| POST | /api/auth/refresh | JWT | 토큰 갱신 |

## 권한 분리

```
/api/admin/** → role=ADMIN 필수
/api/** → role=USER 또는 ADMIN
/api/auth/** → 인증 불필요
```
