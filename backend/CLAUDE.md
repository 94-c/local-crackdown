# Backend — Kotlin + Spring Boot

## SuperClaude Skills (Backend Superpowers)

### 권장 스킬
| 스킬 | 용도 | 예시 |
|------|------|------|
| `/sc:build` | Gradle 빌드/검증 | `./gradlew build -x test` 실행 및 에러 분석 |
| `/sc:troubleshoot` | 빌드/런타임 에러 진단 | Gradle 실패, Spring Boot 시작 오류, DB 연결 문제 |
| `/sc:implement` | 기능 구현 | 새 엔티티/서비스/컨트롤러 생성 |
| `/sc:analyze` | 코드 품질 분석 | 보안 취약점, 성능 이슈, 아키텍처 점검 |
| `/sc:improve` | 코드 개선 | 리팩토링, N+1 쿼리 해결, 트랜잭션 최적화 |
| `/sc:test` | 테스트 실행 | JUnit 테스트, 통합 테스트 |
| `/sc:design` | API/DB 설계 | 새 엔드포인트, 마이그레이션, 엔티티 관계 설계 |
| `/sc:cleanup` | 데드코드 제거 | 미사용 import, 빈 서비스 메서드 정리 |

### 빌드 명령어
```bash
./gradlew build -x test    # 컴파일 검증 (필수 — 모든 변경 후 실행)
./gradlew bootRun           # 서버 실행 (localhost:8080)
./gradlew test              # 테스트
```

## Tech
- Kotlin 2.1.10, Spring Boot 3.4.3, Gradle 8.14 (Kotlin DSL)
- JDK 17 toolchain
- Postgres 16, Flyway (V1~V14), JPA + Hibernate
- JWT (jjwt 0.12.6), AWS SDK v2 (S3 — s3:2.29.45)
- Spring Security, Spring Validation

## Architecture (Clean Architecture)
```
src/main/kotlin/com/challenge/
├── ChallengeApplication.kt
├── domain/
│   ├── entity/          # 21 JPA 엔티티
│   │   ├── User.kt, Role.kt
│   │   ├── Challenge.kt, ChallengeStatus.kt
│   │   ├── Team.kt, GoalType.kt
│   │   ├── InBodyRecord.kt, UserGoal.kt
│   │   ├── MissionTemplate.kt, TeamMission.kt, MissionVerification.kt
│   │   ├── WeeklySnapshot.kt
│   │   ├── PenaltyMission.kt, PenaltyVerification.kt
│   │   ├── FinalScore.kt
│   │   ├── ChallengeParticipant.kt, Notification.kt
│   │   ├── FeedEvent.kt, FeedCheer.kt, FeedEventType.kt
│   │   └── PushSubscription.kt
│   └── repository/      # 18 Spring Data JPA 인터페이스
├── application/
│   ├── service/         # 19 서비스 클래스
│   └── dto/             # 15 DTO 파일
├── infrastructure/
│   ├── config/          # DataSeeder, SecurityConfig
│   ├── security/        # JwtProvider, JwtAuthenticationFilter
│   └── storage/         # S3StorageService
└── presentation/
    ├── controller/      # 27 REST 컨트롤러
    └── advice/          # GlobalExceptionHandler
```

## API Endpoints (현행)

### Public
- `POST /api/auth/signup` — 회원가입
- `POST /api/auth/login` — 로그인 (JWT 발급)
- `POST /api/auth/admin/login` — Admin 로그인
- `GET /api/health` — 헬스체크
- `GET /api/challenges/invite/{code}` — 초대 코드 조회

### User (인증 필요)
- `GET/PUT /api/users/profile` — 프로필 조회/수정
- `GET/POST/DELETE /api/inbody` — 인바디 기록 CRUD
- `GET/POST /api/goals` — 목표 설정/조회
- `GET /api/goals/achievement` — 달성률 조회
- `GET /api/goal-types` — 목표 유형 목록
- `GET /api/teams/me` — 내 팀 조회
- `GET/POST /api/team-missions` — 팀 미션
- `PUT /api/team-missions/{id}/progress` — 미션 진행률
- `GET /api/mission-templates` — 미션 템플릿 목록
- `GET/POST /api/verifications` — 미션 인증
- `GET /api/weekly-results/me` — 내 주간 결과
- `GET /api/penalties/me` — 내 벌칙 미션
- `POST /api/penalty-verifications` — 벌칙 인증 등록
- `POST /api/challenges/{id}/join` — 챌린지 참여
- `GET /api/challenges/{id}/my-status` — 참여 상태
- `GET/PUT /api/notifications` — 알림
- `POST /api/storage/presigned-url` — 이미지 업로드 URL

### Admin (`/api/admin/**`)
- `GET/POST/PUT/DELETE /api/admin/challenges` — 챌린지 CRUD (cascade 삭제)
- `GET /{id}/members` — 챌린지 멤버 상세
- `GET/POST/DELETE /api/admin/teams` — 팀 관리
- `POST /api/admin/teams/auto-assign` — 자동 팀배정
- `GET/DELETE /api/admin/users` — 사용자 관리
- `GET /api/admin/users/search` — 사용자 검색
- `GET/PUT /api/admin/participants` — 참여 승인/거절
- `POST /api/admin/weekly-close` — 주간 마감
- `GET /api/admin/weekly-results` — 주간 결과
- `POST/GET/PUT /api/admin/penalties` — 벌칙 미션
- `PUT /api/admin/penalty-verifications/{id}/approve` — 벌칙 승인
- `GET/PUT /api/admin/verifications` — 미션 인증 승인
- `POST /api/admin/final-scores/calculate` — 최종 점수
- `GET /api/admin/final-scores` — 최종 순위
- `POST /api/admin/notifications/remind` — 미입력 알림 발송

## Coding Rules
- Entity → `domain/entity/`, Repository → `domain/repository/`
- Service → `application/service/` (`@Service` + `@Transactional`)
- DTO → `application/dto/` (data class)
- Controller → `presentation/controller/` (`@RestController`)
- API prefix: `/api/**`, Admin: `/api/admin/**`
- 삭제 시 cascade 고려 (ChallengeService.deleteChallenge 참고)
- 새 엔티티 추가 시 Flyway 마이그레이션 필수

## Database
- Flyway migration: `src/main/resources/db/migration/V{N}__description.sql`
- 현재: V1~V14 (users, challenges, teams, goals, inbody, missions, snapshots, penalties, participants, notifications, feed, push)
- 네이밍: snake_case (DB), camelCase (Kotlin)

## Environment
- Config: `src/main/resources/application.yml` (환경변수 바인딩)
- 주요 환경변수: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, JWT_SECRET, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY
