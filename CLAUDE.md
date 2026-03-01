# Local Crackdown (지방단속) — Project Rules

## Overview
4주 팀 경쟁 챌린지 관리 시스템 MVP (Sprint 1~5 구현 완료)

## Repository Structure
```
local-crackdown/
├── backend/             # Kotlin + Spring Boot 3 + Gradle
├── frontend/            # Next.js 15 + TypeScript + Tailwind v4
├── docs/                # 기획 문서 (모든 작업의 기준)
│   ├── PLAN.md          # 전체 운영 계획서
│   ├── AUTH.md          # 인증 설계 (카카오 OAuth + Admin)
│   ├── SCREENS.md       # 화면 구조 및 라우팅
│   ├── DATA-FLOW.md     # 데이터 흐름 및 핵심 규칙
│   ├── ROADMAP.md       # 구현 로드맵
│   └── TEST-SCENARIOS.md
├── docker-compose.yml   # Postgres 16 + MinIO
├── Makefile             # dev/backend/frontend/db/stop
└── .gitignore
```

## Tech Stack
- Backend: Kotlin 2.1.10, Spring Boot 3.4.3, Gradle 8.14 (Kotlin DSL), JDK 17, Postgres 16
- Frontend: Next.js 15.2.1, React 19, TypeScript 5.9, Tailwind CSS v4, PWA
- Infra: Docker Compose, MinIO (S3-compatible)
- Auth: JWT (이메일+비밀번호 로그인, 카카오 OAuth2 준비)
- DB Migration: Flyway V1~V8

## Development Commands
```bash
make dev          # DB + Backend + Frontend 동시 실행
make backend      # 백엔드만 (localhost:8080)
make frontend     # 프론트엔드만 (localhost:3000)
make db           # Postgres + MinIO (Docker)
make stop         # 전체 중지
```

## Development Workflow

### Branch Rules
- 모든 작업은 `main`에서 feature branch 생성
- Branch naming: `{type}/{feature-name}`
  - `feat/` — 기능 구현
  - `fix/` — 버그 수정
  - `docs/` — 문서 작업
  - `refactor/` — 리팩토링
- 작업 완료 → commit → push → PR → merge to main

### Documentation-Driven (Vibe Coding)
- 모든 개발에 `docs/` 문서를 함께 관리
- 새 기능 구현 시 관련 문서 먼저 확인/업데이트 후 코드 작성
- API 추가 시 docs/에 엔드포인트 문서 반영

### Sub-Agent Strategy
- Backend와 Frontend는 **병렬 서브에이전트**로 작업
- 각 에이전트는 자기 프로젝트의 CLAUDE.md를 참조
- Main 에이전트가 결과 취합, docs 업데이트, 커밋 담당

## Auth
- 일반 유저: 이메일 + 비밀번호 (카카오 OAuth2 전환 예정)
- Admin: 이메일 + 비밀번호 (별도 계정, DataSeeder로 시드)
- JWT claim: `sub`(userId), `email`, `role`(USER|ADMIN)

## Implemented Features (Sprint 1~5)
1. **Auth**: 회원가입/로그인, JWT, 권한 분리 (USER/ADMIN), Admin 시드
2. **Sprint 1**: Challenge, Team, GoalType 엔티티 + Admin 챌린지/팀 관리
3. **Sprint 2**: InBody 기록, UserGoal 목표 설정, 달성률 계산, 온보딩 위저드
4. **Sprint 3**: MissionTemplate, TeamMission, MissionVerification + 팀 미션/인증
5. **Sprint 4**: WeeklySnapshot, 주간 마감(Close Week), 순위 산정, 하위 2팀
6. **Sprint 5**: PenaltyMission, 벌칙 인증/승인, FinalScore 4주 합산
