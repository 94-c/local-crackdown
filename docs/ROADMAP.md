# 구현 로드맵

## 완료

### Auth (인증)
- [x] 회원가입 (이메일 + 비밀번호 + 닉네임, role=USER)
- [x] 로그인 (USER/ADMIN 공용)
- [x] JWT (role claim 포함)
- [x] 권한 분리 (ADMIN/USER)
- [x] Admin 시드 계정 자동 생성

---

## Sprint 1: 기반 엔티티 + Admin 챌린지 관리 ✅

### Backend
- [x] Challenge 엔티티 (이름, 설명, 시작일, 종료일, 상태)
- [x] Team 엔티티 (챌린지 소속, 팀원 2명)
- [x] GoalType 엔티티 (목표 유형: 체중감량, 근육량증가 등)
- [x] Flyway 마이그레이션 (V4)
- [x] Admin API: 챌린지 CRUD
- [x] Admin API: 팀 구성 (유저 2명 → 팀 배정)
- [x] GoalType API (인증 유저 조회)
- [x] 유저 본인 팀 조회 API

### Frontend
- [x] Admin 레이아웃 + 네비게이션
- [x] Admin 대시보드
- [x] /admin/challenges — 챌린지 생성/관리
- [x] /admin/users — 사용자 목록 + 팀 배정
- [x] 공유 TypeScript 타입 (lib/types.ts)

---

## Sprint 2: 유저 온보딩 + 개인 기록

### Backend
- [ ] InBody 엔티티 (체중, 골격근량, 체지방률, 날짜)
- [ ] UserGoal 엔티티 (유저별 목표 + 목표값)
- [ ] 달성률 계산 로직 (누적, 100% cap)
- [ ] API: 인바디 입력/조회
- [ ] API: 목표 설정

### Frontend
- [ ] /onboarding — 시작 인바디 + 목표 설정
- [ ] /profile — 개인 목표, 인바디 기록

---

## Sprint 3: 팀 미션 시스템

### Backend
- [ ] MissionTemplate 엔티티 (미션 유형 템플릿)
- [ ] TeamMission 엔티티 (주간 팀 미션)
- [ ] MissionVerification 엔티티 (인증 업로드)
- [ ] S3 presigned URL 연동
- [ ] API: 팀 미션 입력/조회
- [ ] API: 미션 인증 업로드

### Frontend
- [ ] /team — 팀 미션 입력/현황
- [ ] /verify — 미션 인증 업로드

---

## Sprint 4: 주간 마감 + 순위

### Backend
- [ ] WeeklySnapshot 엔티티 (immutable)
- [ ] Close Week 로직 (달성률 → 팀 점수 → 순위 → 하위 2팀)
- [ ] 누락자 처리 (직전 주 유지)
- [ ] API: 주간 마감 실행 (Admin)
- [ ] API: 주간 결과 조회

### Frontend
- [ ] /admin/weekly-close — 마감 실행
- [ ] /admin/rankings — 순위표
- [ ] /result — 유저 주간 결과
- [ ] 홈 대시보드 (마감 카운트다운)

---

## Sprint 5: 벌칙 미션 + 시즌 종료

### Backend
- [ ] PenaltyMission 엔티티 (룰렛 미션)
- [ ] 벌칙 미션 인증 + Admin 승인
- [ ] FinalScore 계산 (4주 합산)
- [ ] 최종 순위 API

### Frontend
- [ ] /admin/missions — 룰렛, 벌칙 미션 배정/승인
- [ ] 최종 결과 페이지

---

## 배포 (기능 완료 후)
- [ ] docs/DEPLOY.md 작성
- [ ] Frontend → Vercel
- [ ] Backend → Railway/Fly.io
- [ ] DB → Supabase/Railway Postgres
- [ ] Storage → Cloudflare R2
