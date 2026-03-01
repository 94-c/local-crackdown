# Local Crackdown — Project Rules

## Overview
4주 팀 경쟁 챌린지 관리 시스템 MVP

## Repository Structure
```
local-crackdown/
├── backend/        # Kotlin + Spring Boot 3 + Gradle
├── frontend/       # Next.js 15 + TypeScript + Tailwind v4
├── docs/           # 기획 문서 (모든 작업의 기준)
└── docker-compose.yml
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

### SuperClaude Skill Workflow
```
/sc:brainstorm  → 요구사항 정리 → docs/ 업데이트
/sc:design      → API/DB 설계 → docs/ 업데이트
/sc:workflow    → 작업 분해 (backend/frontend 태스크)
/sc:implement   → 서브에이전트로 병렬 구현
/sc:test        → 테스트 실행
/sc:analyze     → 코드 품질 검증
/sc:git         → 브랜치 커밋 → PR
```

### Sub-Agent Strategy
- Backend와 Frontend는 **병렬 서브에이전트**로 작업
- 각 에이전트는 자기 프로젝트의 CLAUDE.md를 참조
- Main 에이전트가 결과 취합, docs 업데이트, 커밋 담당

## Key Documents (반드시 참조)
- `docs/PLAN.md` — 전체 운영 계획서
- `docs/AUTH.md` — 인증 설계 (카카오 OAuth + Admin)
- `docs/SCREENS.md` — 화면 구조 및 라우팅
- `docs/DATA-FLOW.md` — 데이터 흐름 및 핵심 규칙

## Auth
- 일반 유저: 카카오 OAuth2
- Admin: 이메일 + 비밀번호 (별도 계정)

## Tech Stack
- Backend: Kotlin, Spring Boot 3, Gradle 8.14 (Kotlin DSL), JDK 17, Postgres 16
- Frontend: Next.js 15, TypeScript, Tailwind CSS v4, PWA
- Infra: Docker Compose, MinIO (S3-compatible)
- Auth: JWT (카카오 OAuth2 + Admin 로그인)
