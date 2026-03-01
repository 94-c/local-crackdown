# 지방단속 (Local Crackdown)

4주 팀 경쟁 챌린지 관리 시스템 MVP

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | Kotlin 2.1 + Spring Boot 3.4 + Gradle + Postgres 16 |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind v4 |
| Storage | S3-compatible (MinIO for local) |
| Auth | JWT (이메일+비밀번호, 카카오 OAuth 전환 예정) |
| Infra | Docker Compose |

## Prerequisites

- Docker & Docker Compose
- Java 17+
- Node.js 20+

## Quick Start

```bash
# 전체 실행 (DB + Backend + Frontend)
make dev

# 개별 실행
make db          # Postgres + MinIO
make backend     # Spring Boot (localhost:8080)
make frontend    # Next.js (localhost:3000)

# 전체 중지
make stop
```

## Manual Setup

```bash
# 1. DB 실행
docker compose up -d postgres minio

# 2. Backend
cd backend
cp .env.example .env
./gradlew bootRun

# 3. Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| MinIO Console | http://localhost:9001 (minioadmin / minioadmin) |
| Health Check | http://localhost:8080/api/health |

## Default Admin Account

앱 시작 시 자동 생성 (DataSeeder):
- Email: `admin@challenge.com`
- Password: `admin1234`

## User Workflow (사용자 플로우)

### 1. 최초 참여 (온보딩)
```
회원가입 → 로그인 → 인바디 입력 → 목표 설정 (1~2개) → 팀 배정 확인
```
- `/signup` → `/login` → `/onboarding` (3단계 위저드) → `/home`

### 2. 매주 월요일 — 팀 미션 입력
```
팀 탭 → 미션 유형 선택 (템플릿) → 목표 수치 입력 → 생성
```
- `/team` — 팀원 중 1명이 입력 (예: 운동 횟수 5회, 러닝 20km)
- 미션은 **팀 단위 1개**

### 3. 주간 진행 (수~일)
```
개인: 인바디 입력 → 달성률 실시간 확인
팀:   미션 수행 → 진행률 업데이트 → 인증 등록
```
- `/profile` — 인바디 기록 입력, 개인 달성률 확인
- `/team` — 팀 미션 진행률 업데이트
- `/verify` — 미션 인증 등록 (메모 + 이미지)

### 4. 주간 마감 후 — 결과 확인
```
이번 주 팀 순위 → 팀 점수 → 하위 2팀 여부 → 미션 성공/실패
```
- `/result` — 주간 결과 조회
- `/home` — 대시보드에 이번 주 결과 카드

### 5. 하위팀일 경우 — 벌칙 미션
```
벌칙 미션 확인 → 팀원 2명 모두 수행 → 인증 → Admin 승인 대기
```

### 6. 시즌 종료
```
4주 합산 최종 순위 확인
```

## Admin Workflow (관리자 플로우)

### Phase 0 — 챌린지 세팅
```
챌린지 생성 → 기간 설정 → 사용자 확인 → 팀 구성 (2인 1팀)
```
- `/admin/challenges` — 챌린지 CRUD
- `/admin/users` — 사용자 목록 확인
- `/admin/teams` — 팀 생성 (팀원 2명 배정)

### Phase 1 — 주 초 관리 (월~화)
```
팀 미션 입력 여부 모니터링 → 미입력 팀 확인
```
- `/admin` — 대시보드에서 전체 현황 확인

### Phase 2 — 주간 모니터링 (수~토)
```
전체 팀 점수 모니터링 → 미입력 개인 확인
```

### Phase 3 — 주간 마감 (일요일)
```
[Close Week N] 클릭 → 시스템 자동 계산:
  1. 개인 달성률 계산
  2. 입력 누락자 → 직전 주 유지
  3. 팀 점수 = 팀원 달성률 평균
  4. 팀 순위 산정
  5. 하위 2팀 확정
  6. 결과 스냅샷 저장 (수정 불가)
```
- `/admin/weekly-close` — 주차 선택 후 마감 실행

### Phase 4 — 하위팀 벌칙 미션 배정
```
하위 2팀 확인 → 벌칙 미션 배정 → 확정
```
- `/admin/missions` — 벌칙 미션 배정

### Phase 5 — 벌칙 인증 관리
```
팀원 2명 인증 확인 → 승인/반려
```
- `/admin/missions` — 인증 승인 처리

### Phase 6 — 시즌 종료 (4주차 마감 후)
```
최종 점수 계산 (4주 합산) → 최종 순위 확정 → 우승팀
```
- `/admin/missions` — 최종 점수 계산 + 순위 확인

## 주간 타임라인

| 시점 | User | Admin |
|------|------|-------|
| 월~화 | 팀 미션 입력 | 미션 입력 모니터링 |
| 수~토 | 인바디 입력 + 미션 수행 + 인증 | 진행 상황 모니터링 |
| 일요일 | - | **주간 마감 실행** |
| 마감 직후 | 결과 확인 | 순위 공개 → 하위 2팀 벌칙 배정 |

## Project Details

| 프로젝트 | 설명 | README |
|----------|------|--------|
| Backend | Kotlin + Spring Boot 3 + Gradle | [backend/README.md](backend/README.md) |
| Frontend | Next.js 15 + TypeScript + Tailwind v4 | [frontend/README.md](frontend/README.md) |
| Docs | 기획 문서 (운영 계획, 인증, 화면, 데이터 흐름) | [docs/](docs/) |
