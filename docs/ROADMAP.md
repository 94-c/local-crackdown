# 구현 로드맵

## 완료

### Auth (인증) ✅
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

## Sprint 2: 유저 온보딩 + 개인 기록 ✅

### Backend
- [x] InBody 엔티티 (체중, 골격근량, 체지방률, 체지방량, 날짜)
- [x] UserGoal 엔티티 (유저별 목표 + 목표값)
- [x] 달성률 계산 로직 (누적, 100% cap)
- [x] API: 인바디 입력/조회/삭제
- [x] API: 목표 설정
- [x] Flyway 마이그레이션 (V5)

### Frontend
- [x] /onboarding — 시작 인바디 + 목표 설정 (3단계 위저드)
- [x] /profile — 개인 목표, 인바디 기록, 달성률 표시
- [x] 인바디 모달 + 체지방률 자동 계산
- [x] 인바디 차트 (recharts)
- [x] 인바디 삭제 버튼

---

## Sprint 3: 팀 미션 시스템 ✅

### Backend
- [x] MissionTemplate 엔티티 (미션 유형 템플릿 + 시드 4종)
- [x] TeamMission 엔티티 (주간 팀 미션)
- [x] MissionVerification 엔티티 (인증 업로드)
- [x] S3 presigned URL 연동 (이미지 업로드)
- [x] API: 팀 미션 입력/조회/진행률 업데이트
- [x] API: 미션 인증 등록/조회
- [x] API: 미션 인증 승인 (Admin)
- [x] Flyway 마이그레이션 (V6)

### Frontend
- [x] /team — 팀 미션 생성/현황/진행률 업데이트
- [x] /verify — 미션 인증 등록/목록 + 이미지 업로드
- [x] 주차 자동 감지 (weekNumber 동적)

---

## Sprint 4: 주간 마감 + 순위 ✅

### Backend
- [x] WeeklySnapshot 엔티티 (immutable)
- [x] Close Week 로직 (달성률 → 팀 점수 → 순위 → 하위 2팀)
- [x] 누락자 처리 (직전 주 유지)
- [x] API: 주간 마감 실행 (Admin)
- [x] API: 주간 결과 조회
- [x] Flyway 마이그레이션 (V7)

### Frontend
- [x] /admin/weekly-close — 마감 실행
- [x] /admin/rankings — 순위표
- [x] /result — 유저 주간 결과
- [x] 홈 대시보드에 이번 주 결과 카드 추가
- [x] 마감 카운트다운 타이머

---

## Sprint 5: 벌칙 미션 + 시즌 종료 ✅

### Backend
- [x] PenaltyMission 엔티티 (룰렛 미션)
- [x] PenaltyVerification 엔티티 (벌칙 인증)
- [x] 벌칙 미션 인증 + Admin 승인
- [x] FinalScore 계산 (4주 합산)
- [x] 최종 순위 API
- [x] Flyway 마이그레이션 (V8)

### Frontend
- [x] /admin/missions — 벌칙 미션 배정(룰렛)/인증 승인/최종 순위

---

## Enhancement 완료 ✅

- [x] 챌린지 초대 링크 시스템 (invite code + /join/[code])
- [x] 인바디 개선 (체지방량 입력 → 체지방률 자동 계산, 모달 UI)
- [x] 유저 기초 정보 (성별, 생년월일, 키) — DB + Backend 완료
- [x] Admin 챌린지 상세 페이지 (/admin/challenges/[id])
- [x] Admin 팀 관리 UX (유저 검색 드롭다운, 자동 팀배정)
- [x] 참여 신청/승인 플로우 (ChallengeParticipant)
- [x] 알림 시스템 (in-app notification)
- [x] 온보딩 모달 (자동 감지)
- [x] 미입력자 알림 발송
- [x] 챌린지 cascade 삭제
- [x] Admin 사용자 삭제
- [x] Admin 인증 승인 API

---

## 미완료 → docs/REMAINING.md 참조

### P0 — 운영 필수
- [ ] 유저 프로필 수정 UI
- [ ] 목표 수정/삭제
- [ ] Admin 대시보드 통계
- [ ] 챌린지 상태 전환 UI

### P1 — 품질/완성도
- [ ] 벌칙 미션 유저 전용 화면
- [ ] 일반 미션 인증 승인 관리 UI (Admin)
- [ ] 알림 삭제

### P2 — 배포/확장
- [ ] 토큰 갱신 (Refresh Token)
- [ ] 카카오 OAuth
- [ ] 배포 설정 + 가이드
- [ ] 페이지네이션
