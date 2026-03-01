# Backend — Kotlin + Spring Boot

## Tech Stack

- Kotlin 2.1.10 + Spring Boot 3.4.3
- Gradle 8.14 (Kotlin DSL), JDK 17
- Postgres 16 + Flyway (V1~V8)
- JPA + Hibernate
- Spring Security + JWT (jjwt 0.12.6)
- AWS SDK v2 (S3/MinIO)

## Setup

```bash
# .env 생성
cp .env.example .env

# DB 실행 (프로젝트 루트에서)
docker compose up -d postgres minio

# 서버 실행
./gradlew bootRun
```

서버: http://localhost:8080

## Commands

```bash
./gradlew bootRun          # 서버 실행
./gradlew build -x test    # 빌드 (테스트 제외)
./gradlew test             # 테스트
```

## Architecture (Clean Architecture)

```
src/main/kotlin/com/challenge/
├── domain/
│   ├── entity/         # JPA 엔티티 (15개)
│   └── repository/     # Spring Data JPA 인터페이스 (13개)
├── application/
│   ├── service/        # 비즈니스 로직 (13개)
│   └── dto/            # Request/Response DTO (10개)
├── infrastructure/
│   ├── config/         # SecurityConfig, DataSeeder
│   ├── security/       # JwtProvider, JwtAuthenticationFilter
│   └── storage/        # S3StorageService
└── presentation/
    ├── controller/     # REST 컨트롤러 (17개)
    └── advice/         # GlobalExceptionHandler
```

## Entities

| Entity | Description |
|--------|-------------|
| User, Role | 사용자 + 역할 (USER/ADMIN) |
| Challenge, ChallengeStatus | 챌린지 + 상태 (PREPARING/ACTIVE/COMPLETED) |
| Team | 2인 1팀 |
| GoalType | 목표 유형 (체중감량, 근육량증가 등) |
| InBodyRecord | 인바디 측정 기록 |
| UserGoal | 개인 목표 설정 |
| MissionTemplate | 미션 템플릿 (운동횟수, 러닝거리 등) |
| TeamMission | 주간 팀 미션 |
| MissionVerification | 미션 인증 |
| WeeklySnapshot | 주간 마감 결과 (immutable) |
| PenaltyMission | 하위팀 벌칙 미션 |
| PenaltyVerification | 벌칙 인증 |
| FinalScore | 시즌 최종 점수 |

## API Endpoints

### Public (인증 불필요)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | 헬스체크 |
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/admin/login` | Admin 로그인 |

### User (인증 필요)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/goal-types` | 목표 유형 목록 |
| GET/POST | `/api/inbody` | 인바디 기록 조회/입력 |
| GET/POST | `/api/goals` | 목표 조회/설정 |
| GET | `/api/goals/achievement` | 달성률 조회 |
| GET | `/api/teams/me` | 내 팀 조회 |
| GET/POST | `/api/team-missions` | 팀 미션 조회/생성 |
| PUT | `/api/team-missions/{id}/progress` | 미션 진행률 업데이트 |
| GET | `/api/mission-templates` | 미션 템플릿 목록 |
| GET/POST | `/api/verifications` | 미션 인증 조회/등록 |
| GET | `/api/weekly-results/me` | 내 주간 결과 |
| GET | `/api/penalty-missions/team/{teamId}` | 벌칙 미션 조회 |
| POST | `/api/penalty-verifications` | 벌칙 인증 등록 |

### Admin (`/api/admin/**`)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST/PUT/DELETE | `/api/admin/challenges` | 챌린지 CRUD |
| GET/POST/DELETE | `/api/admin/teams` | 팀 관리 |
| GET | `/api/admin/users` | 사용자 목록 |
| POST | `/api/admin/weekly-close/{challengeId}/week/{weekNumber}` | 주간 마감 |
| GET | `/api/admin/weekly-close/{challengeId}/rankings` | 순위 조회 |
| POST | `/api/admin/penalty-missions` | 벌칙 미션 배정 |
| PUT | `/api/admin/penalty-missions/{id}/approve` | 벌칙 승인 |
| POST | `/api/admin/final-scores/{challengeId}/calculate` | 최종 점수 계산 |
| GET | `/api/admin/final-scores/{challengeId}` | 최종 순위 조회 |

## Database Migrations (Flyway)

```
src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__add_kakao_and_role_to_users.sql
├── V3__remove_kakao_fields.sql
├── V4__create_challenge_team_goaltype.sql
├── V5__create_inbody_records_and_user_goals.sql
├── V6__create_mission_tables.sql
├── V7__create_weekly_snapshots.sql
└── V8__create_penalty_and_final_score_tables.sql
```

## Environment Variables

`.env.example` 참조:

| Variable | Description |
|----------|-------------|
| DB_URL | Postgres URL |
| DB_USERNAME | DB 사용자 |
| DB_PASSWORD | DB 비밀번호 |
| JWT_SECRET | JWT 서명 키 |
| ADMIN_EMAIL | Admin 시드 이메일 |
| ADMIN_PASSWORD | Admin 시드 비밀번호 |
| S3_ENDPOINT | MinIO/S3 엔드포인트 |
| S3_ACCESS_KEY | S3 액세스 키 |
| S3_SECRET_KEY | S3 시크릿 키 |
| S3_BUCKET | S3 버킷명 |
