# 인증 설계

## 개요

| 역할 | 인증 방식 | 설명 |
|------|----------|------|
| 일반 유저 | 이메일 + 비밀번호 | 간편 회원가입 → 로그인 |
| Admin | 이메일 + 비밀번호 | 별도 생성, role=ADMIN |

## 유저 인증 플로우 (간편 가입)

```
회원가입:
1. /signup 페이지 접속
2. 닉네임 + 이메일 + 비밀번호 입력
3. POST /api/auth/signup → User 생성 (role=USER)
4. /login으로 리다이렉트

로그인:
1. /login 페이지 접속
2. 이메일 + 비밀번호 입력
3. POST /api/auth/login → JWT 발급
4. JWT 저장 (localStorage) → 홈으로 이동
```

## Admin 인증 플로우

```
1. /admin/login 페이지 접속
2. 이메일 + 비밀번호 입력
3. POST /api/auth/login → JWT 발급 (role=ADMIN)
4. JWT 저장 → /admin으로 이동
```

> Admin 계정은 DB에서 직접 생성하거나 별도 관리

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

| Method | Path | Auth | 설명 | 구현 상태 |
|--------|------|------|------|----------|
| POST | /api/auth/signup | No | 회원가입 (role=USER) | **완료** |
| POST | /api/auth/login | No | 로그인 (USER/ADMIN 공용) | **완료** |
| GET | /api/auth/me | JWT | 현재 유저 정보 | **완료** |
| POST | /api/auth/refresh | JWT | 토큰 갱신 | 미구현 |

## 권한 분리

```
/api/admin/** → role=ADMIN 필수 (hasRole("ADMIN"))
/api/auth/**  → 인증 불필요 (permitAll)
/api/**       → role=USER 또는 ADMIN (authenticated)
```

## 프론트엔드 페이지

| 경로 | 설명 |
|------|------|
| /login | 이메일+비밀번호 로그인 |
| /signup | 간편 회원가입 (닉네임, 이메일, 비밀번호) |
| /admin/login | Admin 로그인 |
