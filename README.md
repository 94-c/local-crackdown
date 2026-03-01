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

## Project Structure

```
local-crackdown/
├── backend/                 # Kotlin + Spring Boot 3
│   └── src/main/kotlin/com/challenge/
│       ├── domain/          # 15 엔티티 + 13 리포지토리
│       ├── application/     # 13 서비스 + 10 DTO
│       ├── infrastructure/  # Security, Config, S3
│       └── presentation/    # 17 컨트롤러
├── frontend/                # Next.js 15 + TypeScript
│   └── src/
│       ├── app/             # 18 페이지 (User 6 + Admin 7 + Public 4 + Landing)
│       ├── components/      # PWA Service Worker
│       └── lib/             # API Client, Auth, Types
├── docs/                    # 기획 문서
│   ├── PLAN.md              # 전체 운영 계획서
│   ├── AUTH.md              # 인증 설계
│   ├── SCREENS.md           # 화면 구조
│   ├── DATA-FLOW.md         # 데이터 흐름
│   ├── ROADMAP.md           # 구현 로드맵
│   └── TEST-SCENARIOS.md    # 테스트 시나리오
├── docker-compose.yml       # Postgres 16 + MinIO
├── Makefile                 # dev/backend/frontend/db/stop
└── README.md
```

## Implemented Features

### Auth
- 회원가입 / 로그인 (JWT)
- 권한 분리 (USER / ADMIN)
- Admin 시드 계정 자동 생성

### Sprint 1 — 기반 엔티티 + Admin 관리
- Challenge, Team, GoalType 엔티티
- Admin: 챌린지 CRUD, 팀 구성

### Sprint 2 — 온보딩 + 개인 기록
- InBody 기록 입력/조회
- 개인 목표 설정 + 달성률 계산
- 온보딩 3단계 위저드

### Sprint 3 — 팀 미션 시스템
- 미션 템플릿 (운동횟수, 러닝거리, 식단인증, 걸음수)
- 주간 팀 미션 생성 + 진행률 업데이트
- 미션 인증 등록

### Sprint 4 — 주간 마감 + 순위
- Admin 주간 마감 (Close Week)
- 개인 달성률 → 팀 점수 → 순위 산정
- 하위 2팀 확정
- WeeklySnapshot (immutable)

### Sprint 5 — 벌칙 미션 + 시즌 종료
- 하위팀 벌칙 미션 배정
- 벌칙 인증 + Admin 승인
- 4주 합산 최종 점수/순위

## Database Migrations

| Version | Description |
|---------|-------------|
| V1 | users 테이블 |
| V2 | kakao + role 필드 |
| V3 | kakao 필드 제거 |
| V4 | challenge, team, goal_type |
| V5 | inbody_records, user_goals |
| V6 | mission_templates, team_missions, mission_verifications |
| V7 | weekly_snapshots |
| V8 | penalty_missions, penalty_verifications, final_scores |
