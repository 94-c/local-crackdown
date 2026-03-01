.PHONY: dev backend frontend db stop

# 백엔드 + 프론트엔드 동시 실행
dev:
	@echo "🚀 DB + Backend + Frontend 실행 중..."
	@make db
	@sleep 2
	@make backend &
	@make frontend

# 백엔드만 실행
backend:
	cd backend && ./gradlew bootRun

# 프론트엔드만 실행
frontend:
	cd frontend && npm run dev

# Postgres + MinIO 실행
db:
	docker compose up -d postgres minio

# 전체 중지
stop:
	@echo "서버 종료 중..."
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@docker compose down 2>/dev/null || true
	@echo "완료"
