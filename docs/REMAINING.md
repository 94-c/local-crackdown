# 남은 기능 목록

> 최종 업데이트: 2026-03-02
> Sprint 1~5 + Enhancement 1~5 + Critical Fixes 완료 후 기준

---

## 구현 완료 현황

### 핵심 기능 (완료)
- [x] 회원가입/로그인 (이메일+비밀번호, JWT, ADMIN/USER 역할 분리)
- [x] 챌린지 CRUD + 초대 링크 (invite code)
- [x] 팀 생성/삭제/자동배정 + 유저 검색 드롭다운
- [x] 인바디 입력/조회/삭제 + 체지방률 자동 계산 + 차트
- [x] 목표 설정 + 달성률 계산 (100% cap)
- [x] 팀 미션 생성/진행률/인증 등록 + 이미지 업로드 (presigned URL)
- [x] 주간 마감 (Close Week) + 순위 산정 + 하위 2팀
- [x] 벌칙 미션 배정 (룰렛) + 인증/승인
- [x] 최종 점수 4주 합산 + 최종 순위
- [x] 참여 신청/승인 플로우
- [x] 알림 시스템 (생성/조회/읽음/미입력 알림 발송)
- [x] 온보딩 모달 (프로필→인바디→목표 3단계)
- [x] 주간 마감 카운트다운 타이머
- [x] 챌린지 cascade 삭제
- [x] 주차 동적 감지 (weekNumber 자동)

---

## 🔴 P0 — 운영 필수 (없으면 실 서비스 불가)

### 1. 유저 프로필 수정 UI
- **현황**: 백엔드 `PUT /api/users/profile` 존재, 프론트 수정 폼 없음
- **해야 할 것**:
  - `/profile` 페이지에 "프로필 수정" 버튼 + 모달/인라인 폼
  - 수정 가능 필드: 닉네임, 성별, 생년월일, 키
- **관련 파일**:
  - `frontend/src/app/(user)/profile/page.tsx`
  - Backend: `AuthService.updateProfile()` (이미 있음)

### 2. 목표 수정/삭제
- **현황**: 온보딩에서 1회 설정 후 변경 불가. API도 UI도 없음
- **해야 할 것**:
  - Backend: `PUT /api/goals` (목표값 수정), `DELETE /api/goals/{id}` (삭제)
  - Frontend: `/profile` 내 목표 카드에 수정/삭제 버튼
- **관련 파일**:
  - `backend/src/main/kotlin/com/challenge/application/service/UserGoalService.kt`
  - `backend/src/main/kotlin/com/challenge/presentation/controller/UserGoalController.kt`
  - `frontend/src/app/(user)/profile/page.tsx`

### 3. Admin 대시보드 통계
- **현황**: 카드 링크만 있고 실제 수치 없음
- **해야 할 것**:
  - 총 챌린지 수, 활성 챌린지 수
  - 총 유저 수, 이번 주 인바디 입력률
  - 총 팀 수, 이번 주 미션 생성률
  - 최근 활동 로그 (알림 기반)
- **관련 파일**:
  - `frontend/src/app/admin/page.tsx`
  - Backend: 통계 API 신규 필요 (`GET /api/admin/dashboard/stats`)

### 4. 챌린지 상태 전환
- **현황**: 백엔드 `PUT /api/admin/challenges/{id}` 에서 status 변경 가능하나, 프론트에서 명시적 버튼 없음
- **해야 할 것**:
  - `/admin/challenges/[id]` 상세 페이지에 상태 변경 버튼 추가
  - PREPARING → ACTIVE → COMPLETED 순차 전환
  - 상태 변경 시 확인 다이얼로그
- **관련 파일**:
  - `frontend/src/app/admin/challenges/[id]/page.tsx`

---

## 🟡 P1 — 품질/완성도 (운영 가능하나 불편)

### 5. 벌칙 미션 유저 전용 페이지
- **현황**: `GET /api/penalties/me` API 존재, 프론트에 전용 화면 없음
- **해야 할 것**:
  - `/home` 또는 `/result` 페이지에서 하위팀일 때 벌칙 미션 카드 표시
  - 벌칙 인증 업로드 링크 연결
  - 또는 `/team` 페이지 하단에 벌칙 미션 섹션 추가
- **관련 파일**:
  - `frontend/src/app/(user)/home/page.tsx` 또는 `team/page.tsx`

### 6. 일반 미션 인증 승인 관리 (Admin)
- **현황**: `PUT /api/admin/verifications/{id}/approve` API 추가 완료, Admin UI 없음
- **해야 할 것**:
  - `/admin/missions` 페이지에 "미션 인증 관리" 탭 추가
  - 챌린지/주차별 인증 목록 조회
  - 인증 이미지 + 메모 확인 후 승인 버튼
- **관련 파일**:
  - `frontend/src/app/admin/missions/page.tsx`
  - Backend: `AdminVerificationController` (이미 있음)

### 7. 알림 삭제
- **현황**: 읽기/읽음처리만 가능, 삭제 불가
- **해야 할 것**:
  - Backend: `DELETE /api/notifications/{id}`, `DELETE /api/notifications/all`
  - Frontend: 알림 항목별 삭제 버튼, 전체 삭제 버튼
- **관련 파일**:
  - `backend/src/main/kotlin/com/challenge/presentation/controller/NotificationController.kt`
  - `frontend/src/app/(user)/notifications/page.tsx`

### 8. 토큰 갱신 (Refresh Token)
- **현황**: JWT 단일 토큰, 만료 시 재로그인 필요
- **해야 할 것**:
  - Backend: Refresh Token 발급/검증 로직
  - Frontend: 401 응답 시 자동 갱신 시도
- **관련 파일**:
  - `backend/src/main/kotlin/com/challenge/infrastructure/security/JwtProvider.kt`
  - `frontend/src/lib/api-client.ts`

---

## 🟢 P2 — 배포/확장 (MVP 이후)

### 9. 카카오 OAuth
- **현황**: 전혀 미구현 (이메일+비밀번호만)
- **해야 할 것**:
  - Backend: Kakao OAuth2 클라이언트 설정, 토큰 검증, 유저 연동
  - Frontend: 카카오 로그인 버튼, 콜백 처리
  - 기존 이메일 유저와 통합 (이메일 기준 연동)
- **참고**: 카카오 개발자 앱 등록 필요

### 10. 배포 설정
- **현황**: Dockerfile 있으나 클라우드 배포 설정 없음
- **해야 할 것**:
  - `docs/DEPLOY.md` 작성
  - Frontend → Vercel (vercel.json)
  - Backend → Railway 또는 Fly.io
  - DB → Supabase 또는 Railway Postgres
  - Storage → Cloudflare R2 또는 S3
  - 환경변수 설정 가이드

### 11. 페이지네이션
- **현황**: 모든 목록이 전체 로드
- **해야 할 것**:
  - Backend: Pageable 파라미터 추가 (Spring Data)
  - Frontend: 무한 스크롤 또는 페이지 번호
  - 대상: 사용자 목록, 참여자 목록, 알림 목록

---

## 구현 순서 (권장)

```
P0-1 유저 프로필 수정 UI ──────────┐
P0-2 목표 수정/삭제 ──────────────┤
P0-3 Admin 대시보드 통계 ──────────┤── 운영 가능 상태
P0-4 챌린지 상태 전환 ─────────────┘
        ↓
P1-5 벌칙 미션 유저 화면 ─────────┐
P1-6 미션 인증 승인 관리 UI ──────┤── 완성도 향상
P1-7 알림 삭제 ───────────────────┘
        ↓
P2-8  토큰 갱신 ──────────────────┐
P2-9  카카오 OAuth ───────────────┤── 확장
P2-10 배포 ───────────────────────┤
P2-11 페이지네이션 ───────────────┘
```

---

## 예상 작업량

| 우선순위 | 항목 수 | 예상 규모 |
|----------|---------|-----------|
| P0 | 4개 | Backend 2~3개 파일 + Frontend 3~4개 파일 |
| P1 | 3개 | Backend 2개 파일 + Frontend 3개 파일 |
| P2 | 3개 | 신규 모듈 + 인프라 설정 |
