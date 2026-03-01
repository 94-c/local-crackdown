# Backend — Kotlin + Spring Boot

## Tech
- Kotlin 2.1.10, Spring Boot 3.4.3, Gradle 8.14 (Kotlin DSL)
- JDK 17 toolchain
- Postgres 16, Flyway, JPA + Hibernate
- JWT (jjwt 0.12.6), AWS SDK v2 (S3)

## Architecture (Clean Architecture)
```
src/main/kotlin/com/challenge/
├── domain/          # Entity, Repository (interface)
│   ├── entity/      # JPA 엔티티
│   └── repository/  # Spring Data JPA 인터페이스
├── application/     # 비즈니스 로직
│   ├── service/     # 서비스 클래스
│   └── dto/         # Request/Response DTO
├── infrastructure/  # 외부 연동, 설정
│   ├── config/      # Spring 설정 (Security, CORS 등)
│   ├── security/    # JWT 관련 (Provider, Filter)
│   └── storage/     # S3 스토리지 서비스
└── presentation/    # API 레이어
    ├── controller/  # REST 컨트롤러
    └── advice/      # 전역 예외 처리
```

## Coding Rules
- Entity는 `domain/entity/`에 위치
- Repository는 `domain/repository/`에 Spring Data JPA interface로 정의
- Service는 `application/service/`에 `@Service` + `@Transactional`
- DTO는 `application/dto/`에 data class로 정의
- Controller는 `presentation/controller/`에 `@RestController`
- API prefix: `/api/**`, Admin API: `/api/admin/**`
- 권한: `/api/auth/**`는 공개, `/api/admin/**`는 ADMIN 전용

## Auth
- 카카오 OAuth2: `/api/auth/kakao` — code → 카카오 API → JWT 발급
- Admin 로그인: `/api/auth/admin/login` — 이메일/비밀번호 → JWT 발급
- JWT claim: `sub`(userId), `email`, `role`(USER|ADMIN)

## Database
- Flyway migration: `src/main/resources/db/migration/V{N}__description.sql`
- 네이밍: snake_case (DB), camelCase (Kotlin)

## Commands
```bash
./gradlew bootRun          # 서버 실행
./gradlew build -x test    # 빌드 (테스트 제외)
./gradlew test             # 테스트
```

## Environment
- Config: `src/main/resources/application.yml` (환경변수 바인딩)
- Local env: `.env` (gitignore됨), `.env.example` 참조
