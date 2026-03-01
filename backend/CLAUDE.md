# Backend — Kotlin + Spring Boot

## Tech
- Kotlin 2.1.10, Spring Boot 3.4.3, Gradle 8.14 (Kotlin DSL)
- JDK 17 toolchain
- Postgres 16, Flyway (V1~V8), JPA + Hibernate
- JWT (jjwt 0.12.6), AWS SDK v2 (S3 — s3:2.29.45)
- Spring Security, Spring Validation

## Architecture (Clean Architecture)
```
src/main/kotlin/com/challenge/
├── ChallengeApplication.kt
├── domain/
│   ├── entity/          # 15 JPA 엔티티
│   │   ├── User.kt, Role.kt
│   │   ├── Challenge.kt, ChallengeStatus.kt
│   │   ├── Team.kt, GoalType.kt
│   │   ├── InBodyRecord.kt, UserGoal.kt
│   │   ├── MissionTemplate.kt, TeamMission.kt, MissionVerification.kt
│   │   ├── WeeklySnapshot.kt
│   │   ├── PenaltyMission.kt, PenaltyVerification.kt
│   │   └── FinalScore.kt
│   └── repository/      # 13 Spring Data JPA 인터페이스
│       ├── UserRepository, ChallengeRepository, TeamRepository
│       ├── GoalTypeRepository, InBodyRecordRepository, UserGoalRepository
│       ├── MissionTemplateRepository, TeamMissionRepository, MissionVerificationRepository
│       ├── WeeklySnapshotRepository
│       ├── PenaltyMissionRepository, PenaltyVerificationRepository
│       └── FinalScoreRepository
├── application/
│   ├── service/         # 13 서비스 클래스
│   │   ├── AuthService, ChallengeService, TeamService
│   │   ├── GoalTypeService, InBodyService, UserGoalService
│   │   ├── MissionTemplateService, TeamMissionService, MissionVerificationService
│   │   ├── WeeklyCloseService
│   │   ├── PenaltyMissionService, PenaltyVerificationService
│   │   └── FinalScoreService
│   └── dto/             # 10 DTO 파일 (data class)
│       ├── AuthDto, ChallengeDto, TeamDto
│       ├── GoalTypeDto, InBodyDto, UserGoalDto
│       ├── MissionDto, WeeklyDto
│       ├── PenaltyDto, FinalScoreDto
├── infrastructure/
│   ├── config/          # DataSeeder (Admin 시드), SecurityConfig
│   ├── security/        # JwtProvider, JwtAuthenticationFilter
│   └── storage/         # S3StorageService
└── presentation/
    ├── controller/      # 17 REST 컨트롤러
    │   ├── AuthController, HealthController
    │   ├── GoalTypeController, InBodyController, UserGoalController
    │   ├── TeamController, TeamMissionController
    │   ├── MissionTemplateController, MissionVerificationController
    │   ├── WeeklyResultController, PenaltyController
    │   ├── AdminChallengeController, AdminTeamController, AdminUserController
    │   ├── AdminWeeklyCloseController, AdminPenaltyController
    │   └── AdminFinalScoreController
    └── advice/          # GlobalExceptionHandler
```

## API Endpoints

### Public
- `POST /api/auth/signup` — 회원가입
- `POST /api/auth/login` — 로그인 (JWT 발급)
- `POST /api/auth/admin/login` — Admin 로그인
- `GET /api/health` — 헬스체크

### User (인증 필요)
- `GET/POST /api/inbody` — 인바디 기록
- `GET/POST /api/goals` — 목표 설정
- `GET /api/goals/achievement` — 달성률 조회
- `GET /api/goal-types` — 목표 유형 목록
- `GET /api/teams/me` — 내 팀 조회
- `GET/POST /api/team-missions` — 팀 미션
- `PUT /api/team-missions/{id}/progress` — 미션 진행률 업데이트
- `GET /api/mission-templates` — 미션 템플릿 목록
- `GET/POST /api/verifications` — 미션 인증
- `GET /api/weekly-results/me` — 내 주간 결과
- `GET /api/penalty-missions/team/{teamId}` — 벌칙 미션 조회
- `POST /api/penalty-verifications` — 벌칙 인증 등록

### Admin (`/api/admin/**`)
- `GET/POST/PUT/DELETE /api/admin/challenges` — 챌린지 CRUD
- `GET/POST/DELETE /api/admin/teams` — 팀 관리
- `GET /api/admin/users` — 사용자 목록
- `POST /api/admin/weekly-close/{challengeId}/week/{weekNumber}` — 주간 마감
- `GET /api/admin/weekly-close/{challengeId}/rankings` — 순위 조회
- `POST /api/admin/penalty-missions` — 벌칙 미션 배정
- `PUT /api/admin/penalty-missions/{id}/approve` — 벌칙 승인
- `POST /api/admin/final-scores/{challengeId}/calculate` — 최종 점수 계산
- `GET /api/admin/final-scores/{challengeId}` — 최종 순위 조회

## Coding Rules
- Entity는 `domain/entity/`에 위치
- Repository는 `domain/repository/`에 Spring Data JPA interface로 정의
- Service는 `application/service/`에 `@Service` + `@Transactional`
- DTO는 `application/dto/`에 data class로 정의
- Controller는 `presentation/controller/`에 `@RestController`
- API prefix: `/api/**`, Admin API: `/api/admin/**`
- 권한: `/api/auth/**`는 공개, `/api/admin/**`는 ADMIN 전용, 나머지는 인증 필요

## Database
- Flyway migration: `src/main/resources/db/migration/V{N}__description.sql`
- V1: users, V2: kakao+role, V3: remove kakao, V4: challenge+team+goaltype
- V5: inbody+usergoal, V6: mission tables, V7: weekly_snapshots, V8: penalty+final_score
- 네이밍: snake_case (DB), camelCase (Kotlin)

## Commands
```bash
./gradlew bootRun          # 서버 실행 (localhost:8080)
./gradlew build -x test    # 빌드 (테스트 제외)
./gradlew test             # 테스트
```

## Environment
- Config: `src/main/resources/application.yml` (환경변수 바인딩)
- Local env: `.env` (gitignore됨), `.env.example` 참조
- 주요 환경변수: DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, S3 설정
