# Local Crackdown

4주 챌린지 관리 시스템 MVP

## Tech Stack

| Layer    | Stack                                      |
|----------|--------------------------------------------|
| Backend  | Kotlin + Spring Boot 3 + Gradle + Postgres |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind |
| Storage  | S3-compatible (MinIO for local)            |
| Auth     | JWT                                        |

## Prerequisites

- Docker & Docker Compose
- Java 17+ (for local backend dev)
- Node.js 20+ (for local frontend dev)

## Quick Start (Docker)

```bash
# Start Postgres + MinIO + Backend
docker compose up -d

# Frontend (run locally)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MinIO Console: http://localhost:9001 (minioadmin / minioadmin)

## Local Development

### Backend

```bash
cd backend
cp .env.example .env

# Start only Postgres and MinIO
docker compose up -d postgres minio

# Run Spring Boot
./gradlew bootRun
```

API health check: `GET http://localhost:8080/api/health`

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## API Endpoints

| Method | Path              | Auth | Description     |
|--------|-------------------|------|-----------------|
| GET    | /api/health       | No   | Health check    |
| POST   | /api/auth/signup  | No   | Register user   |
| POST   | /api/auth/login   | No   | Login (get JWT) |

## Project Structure

```
local-crackdown/
├── backend/
│   └── src/main/kotlin/com/challenge/
│       ├── domain/          # Entities, repositories
│       ├── application/     # Services, DTOs
│       ├── infrastructure/  # Config, security, storage
│       └── presentation/    # Controllers, advice
├── frontend/
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # Shared components
│       └── lib/             # API client, utilities
├── docker-compose.yml
└── README.md
```
