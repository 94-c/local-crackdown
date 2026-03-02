# Local Crackdown (지방단속) — Project Rules

## Overview
4주 팀 경쟁 챌린지 관리 시스템 MVP
Sprint 1~5 + Enhancement + Critical Fixes 구현 완료

## SuperClaude Skills (Superpowers)

### 사용 가능한 스킬
| 스킬 | 용도 | 사용 시점 |
|------|------|----------|
| `/sc:agent` | 세션 오케스트레이션 | 작업 시작 시 자동 |
| `/sc:brainstorm` | 요구사항 탐색 | 새 기능 기획 시 |
| `/sc:design` | 아키텍처/API 설계 | 구조 결정 시 |
| `/sc:implement` | 기능 구현 | 코드 작성 시 |
| `/sc:build` | 빌드/패키징 | 빌드 검증 시 |
| `/sc:test` | 테스트 실행 | 품질 검증 시 |
| `/sc:troubleshoot` | 이슈 진단 | 에러 해결 시 |
| `/sc:analyze` | 코드 분석 | 리뷰/점검 시 |
| `/sc:improve` | 코드 개선 | 리팩토링 시 |
| `/sc:cleanup` | 데드코드 제거 | 정리 시 |
| `/sc:git` | Git 워크플로우 | 커밋/PR 시 |
| `/sc:research` | 웹 리서치 | 기술 조사 시 |
| `/sc:document` | 문서 생성 | 문서화 시 |
| `/sc:workflow` | PRD → 워크플로우 | 작업 분배 시 |
| `/sc:estimate` | 작업량 추정 | 일정 계획 시 |
| `/sc:pm` | 프로젝트 매니저 | 전체 관리 시 |
| `/sc:spawn` | 멀티 에이전트 분배 | 대규모 작업 시 |

### Sub-Agent 전략
- **Backend 서브에이전트**: `/sc:build`, `/sc:troubleshoot`, `/sc:implement` 활용
- **Frontend 서브에이전트**: `/sc:build`, `/sc:implement`, `/sc:analyze` 활용
- **Main 에이전트**: `/sc:pm`, `/sc:git`, `/sc:document` 로 취합/관리
- 병렬 작업 시 Task 도구로 Backend/Frontend 동시 실행

## Repository Structure
```
local-crackdown/
├── backend/             # Kotlin + Spring Boot 3 + Gradle
│   └── CLAUDE.md        # 백엔드 전용 규칙 + 스킬
├── frontend/            # Next.js 15 + TypeScript + Tailwind v4
│   └── CLAUDE.md        # 프론트엔드 전용 규칙 + 스킬
├── docs/                # 기획 문서 (모든 작업의 기준)
│   ├── PLAN.md          # 전체 운영 계획서
│   ├── AUTH.md          # 인증 설계
│   ├── SCREENS.md       # 화면 구조 및 라우팅
│   ├── DATA-FLOW.md     # 데이터 흐름 및 핵심 규칙
│   ├── ROADMAP.md       # 구현 로드맵 (현행화 완료)
│   ├── REMAINING.md     # 남은 기능 목록 (P0~P2)
│   ├── ENHANCEMENT.md   # 보강 작업 (전체 완료)
│   └── TEST-SCENARIOS.md
├── docker-compose.yml   # Postgres 16 + MinIO
├── Makefile             # dev/backend/frontend/db/stop
└── .gitignore
```

## Tech Stack
- Backend: Kotlin 2.1.10, Spring Boot 3.4.3, Gradle 8.14 (Kotlin DSL), JDK 17, Postgres 16
- Frontend: Next.js 15.2.1, React 19, TypeScript 5.9, Tailwind CSS v4, PWA
- Infra: Docker Compose, MinIO (S3-compatible)
- Auth: JWT (이메일+비밀번호, 카카오 OAuth2 예정)
- DB Migration: Flyway V1~V14

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
- 작업 완료 → commit → push → main 머지 → push

### Documentation-Driven (Vibe Coding)
- 모든 개발에 `docs/` 문서를 함께 관리
- 새 기능 구현 시 `docs/REMAINING.md` 확인 후 코드 작성
- 완료 시 `docs/ROADMAP.md` 업데이트

### Sub-Agent Strategy
- Backend와 Frontend는 **병렬 서브에이전트**로 작업
- 각 에이전트는 자기 프로젝트의 CLAUDE.md를 참조
- Main 에이전트가 결과 취합, docs 업데이트, 커밋 담당

## Auth
- 일반 유저: 이메일 + 비밀번호 (카카오 OAuth2 전환 예정)
- Admin: 이메일 + 비밀번호 (별도 계정, DataSeeder 시드: admin@challenge.com / admin1234!)
- JWT claim: `sub`(userId), `email`, `role`(USER|ADMIN)

## Implemented Features
1. **Auth**: 회원가입/로그인, JWT, 권한 분리, Admin 시드
2. **Sprint 1**: Challenge, Team, GoalType + Admin CRUD
3. **Sprint 2**: InBody 기록 (체지방량→체지방률 자동계산), 목표 설정, 달성률
4. **Sprint 3**: 팀 미션, 인증 등록 + 이미지 업로드 (presigned URL)
5. **Sprint 4**: 주간 마감, 순위 산정, 하위 2팀
6. **Sprint 5**: 벌칙 미션 (룰렛), 인증/승인, 최종 4주 합산
7. **Enhancement**: 초대 링크, 참여 신청/승인, 자동 팀배정, 알림, 온보딩 모달, 카운트다운
8. **Critical Fixes**: cascade 삭제, 인바디 삭제, 동적 주차, 인증 승인 API, 사용자 관리

## Remaining → docs/REMAINING.md
- P0: 프로필 수정 UI, 목표 수정/삭제, Admin 대시보드 통계, 챌린지 상태 전환
- P1: 벌칙 유저 화면, 인증 승인 관리 UI, 알림 삭제
- P2: 토큰 갱신, 카카오 OAuth, 배포, 페이지네이션
