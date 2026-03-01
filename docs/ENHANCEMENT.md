# 보강 작업 계획서

> Sprint 1~5 기능 완료 후, 실제 운영 가능한 수준으로 보강하는 작업 목록

---

## 현재 문제점 요약

| 영역 | 문제 |
|------|------|
| 챌린지 참여 | 유저가 스스로 챌린지에 참여하는 방법이 없음 (Admin이 직접 유저ID 입력) |
| 챌린지 관리 | 상세보기 페이지 없음, 참여 멤버 현황 확인 불가, 초대 링크 없음 |
| 인바디 입력 | 체지방률을 직접 입력 → 체지방량(kg) 입력 후 자동 계산이어야 함 |
| 인바디 UX | 인라인 폼 → 모달(팝업) + 측정 날짜 선택 필요 (기록 = 스토리) |
| 유저 프로필 | 성별, 나이, 키 등 기초 정보 수집 없음 |

---

## Enhancement 1: 챌린지 초대 링크 시스템

### 목적
PLAN.md Phase 0 "초대 링크 접속" 구현. Admin이 챌린지 생성 후 링크를 발급하고, 유저가 해당 링크로 접속하여 자연스럽게 참여하는 플로우.

### Backend
- [ ] Flyway: `challenges` 테이블에 `invite_code VARCHAR(20) UNIQUE` 컬럼 추가
- [ ] 챌린지 생성 시 `invite_code` 자동 생성 (8자리 랜덤 영숫자)
- [ ] `GET /api/challenges/invite/{code}` — 초대 코드로 챌린지 공개 정보 조회 (비인증)
- [ ] `POST /api/challenges/join` — 초대 코드로 챌린지 참여 신청 (인증 필요)

### Frontend
- [ ] `/join/[code]` 페이지 — 초대 링크 랜딩 (챌린지 정보 표시 → 로그인/회원가입 유도)
- [ ] 회원가입/로그인 후 자동으로 챌린지 참여 연결

### 참여 플로우
```
Admin이 초대 링크 복사 → 카톡/메신저로 공유
→ 유저 링크 클릭 → /join/[code] 랜딩
→ 챌린지 정보 확인 → 회원가입 or 로그인
→ 기초 정보 입력 (Enhancement 3)
→ 시작 인바디 입력 (Enhancement 2)
→ 목표 설정
→ 참여 완료 (팀 배정은 Admin)
```

---

## Enhancement 2: 인바디 기록 개선

### 목적
인바디는 챌린지의 **기초 데이터**이자 유저의 **변화 스토리**. 정확한 입력 + 날짜별 기록 관리 필수.

### 핵심 변경: 체지방량(kg) 입력 → 체지방률 자동 계산

**현재 (문제)**
```
입력: 체중(kg), 골격근량(kg), 체지방률(%) ← 직접 입력
```

**변경 후**
```
입력: 체중(kg), 골격근량(kg), 체지방량(kg)
자동계산: 체지방률(%) = 체지방량(kg) / 체중(kg) × 100
```

### Backend
- [ ] Flyway: `inbody_records` 테이블에 `body_fat_mass DECIMAL(5,2)` 컬럼 추가
- [ ] `body_fat_percentage`는 서버에서 자동 계산하여 저장 (입력값에서 제거)
- [ ] InBodyRecordRequest 수정: `bodyFatPercentage` → `bodyFatMass`
- [ ] InBodyRecordResponse: `bodyFatMass` + `bodyFatPercentage` 둘 다 반환
- [ ] 입력 유효성 검증 추가
  - 체중: 30~200kg
  - 골격근량: 10~60kg, 체중 미만
  - 체지방량: 1~100kg, 체중 미만
  - 골격근량 + 체지방량 ≤ 체중

### Frontend
- [ ] 인바디 입력을 **모달(팝업)** 으로 변경 (인라인 폼 제거)
- [ ] 모달 구성:
  - 측정 날짜 선택 (DatePicker, 기본값: 오늘)
  - 체중 (kg)
  - 골격근량 (kg)
  - 체지방량 (kg)
  - **체지방률 (%) — 자동 계산 표시 (읽기 전용)**
- [ ] 입력 시 실시간으로 체지방률 미리보기
- [ ] 온보딩 Step 1도 동일하게 변경
- [ ] 프로필 페이지 인바디 기록 테이블에 `체지방량` 컬럼 추가
- [ ] 기록 히스토리: 날짜 표시 강화 (언제 측정했는지 명확하게)

### 적용 위치
| 위치 | 변경 |
|------|------|
| `/onboarding` Step 1 | 모달 방식 + 체지방량 입력 + 자동 계산 |
| `/profile` 새 기록 입력 | 모달 방식 + 체지방량 입력 + 자동 계산 |
| `/profile` 기록 테이블 | 체지방량 컬럼 추가, 날짜 표시 강화 |

---

## Enhancement 3: 유저 기초 정보 수집

### 목적
챌린지 참여 시 기초 정보를 수집하여 데이터 분석 및 목표 설정에 활용.

### Backend
- [ ] Flyway: `users` 테이블에 컬럼 추가
  - `gender VARCHAR(10)` (MALE/FEMALE)
  - `birth_date DATE`
  - `height DECIMAL(5,1)` (키, cm)
- [ ] `PUT /api/users/profile` — 기초 정보 업데이트 API
- [ ] 기초 정보 입력 완료 여부 판단 (`gender`, `birthDate`, `height` 모두 NOT NULL)

### Frontend
- [ ] 챌린지 참여 플로우에서 기초 정보 입력 단계 추가
  - 성별 선택 (남/여)
  - 생년월일 입력
  - 키(cm) 입력
- [ ] 온보딩 위저드에 Step 0 추가: 기초 정보 → 인바디 → 목표 → 완료 (4단계)
- [ ] 이미 입력된 경우 스킵

---

## Enhancement 4: Admin 챌린지 상세 페이지

### 목적
챌린지를 생성한 후 상세 정보 확인, 수정, 참여 멤버 관리, 초대 링크 발급을 한 곳에서.

### Backend
- [ ] `GET /api/admin/challenges/{id}/members` — 챌린지 참여 멤버 목록 (팀별 그룹핑)
  - 팀명, 멤버 닉네임, 이메일
  - 인바디 입력 여부 (최근 기록 날짜)
  - 목표 설정 여부
  - 온보딩 완료 여부

### Frontend — `/admin/challenges/[id]`
- [ ] **기본 정보 섹션**
  - 제목, 설명, 시작일~종료일, 상태 배지, 현재 주차
  - 수정 버튼 → 인라인 편집 or 수정 모달
- [ ] **초대 링크 섹션**
  - 초대 코드 표시
  - 전체 링크 표시 + 복사 버튼
  - 링크 재생성 버튼
- [ ] **참여 현황 섹션**
  - 총 팀 수 / 총 참가자 수
  - 팀 목록 (팀명, 멤버1, 멤버2)
  - 각 멤버: 닉네임, 이메일, 인바디 입력 여부, 목표 설정 여부
  - 미완료 멤버 하이라이트 (빨간색)
- [ ] `/admin/challenges` 목록에서 챌린지 클릭 → 상세 페이지 이동

---

## Enhancement 5: Admin 팀 관리 UX 개선

### 목적
현재 팀 생성 시 유저 ID(UUID)를 직접 입력해야 함 → 사용자 검색/선택 방식으로 변경.

### Frontend
- [ ] 팀 생성 시 유저 검색 드롭다운 (닉네임/이메일 검색)
- [ ] 챌린지 상세 페이지에서 팀 추가/삭제 가능
- [ ] 챌린지에 참여 신청한 유저 목록에서 바로 팀 배정

---

## DB 마이그레이션 요약 (V9)

```sql
-- Enhancement 1: 챌린지 초대 코드
ALTER TABLE challenges ADD COLUMN invite_code VARCHAR(20) UNIQUE;

-- Enhancement 2: 인바디 체지방량
ALTER TABLE inbody_records ADD COLUMN body_fat_mass DECIMAL(5,2);

-- Enhancement 3: 유저 기초 정보
ALTER TABLE users ADD COLUMN gender VARCHAR(10);
ALTER TABLE users ADD COLUMN birth_date DATE;
ALTER TABLE users ADD COLUMN height DECIMAL(5,1);
```

---

## 구현 순서 (의존성 기반)

```
Enhancement 1 (초대 링크) ← 가장 먼저. 유저 참여 플로우의 시작점
    ↓
Enhancement 3 (기초 정보) ← 참여 시 입력
    ↓
Enhancement 2 (인바디 개선) ← 참여 후 첫 기록
    ↓
Enhancement 4 (챌린지 상세) ← Admin이 현황 확인
    ↓
Enhancement 5 (팀 관리 UX) ← Admin이 팀 배정
```

---

## 변경 영향 범위

### Backend 변경 파일
| 파일 | 변경 |
|------|------|
| `Challenge.kt` | `inviteCode` 필드 추가 |
| `User.kt` | `gender`, `birthDate`, `height` 필드 추가 |
| `InBodyRecord.kt` | `bodyFatMass` 필드 추가 |
| `ChallengeService.kt` | 초대 코드 생성/검증 로직 |
| `InBodyService.kt` | 체지방률 자동 계산 |
| `AuthService.kt` | 기초 정보 업데이트 |
| `ChallengeDto.kt` | 초대 코드 관련 DTO |
| `InBodyDto.kt` | bodyFatMass 추가, bodyFatPercentage 계산 |
| `AuthDto.kt` | ProfileUpdateRequest 추가 |
| Flyway V9 | 스키마 변경 |
| 새 Controller/Endpoint | 초대 참여, 프로필 업데이트 |

### Frontend 변경 파일
| 파일 | 변경 |
|------|------|
| `/join/[code]/page.tsx` | **신규** — 초대 링크 랜딩 |
| `/admin/challenges/[id]/page.tsx` | **신규** — 챌린지 상세 |
| `/admin/challenges/page.tsx` | 목록에서 상세 이동 링크 추가 |
| `/(user)/onboarding/page.tsx` | 기초 정보 Step 추가, 인바디 모달 전환, 체지방량 입력 |
| `/(user)/profile/page.tsx` | 인바디 모달 전환, 기록 테이블 개선 |
| `/lib/types.ts` | 타입 업데이트 |
| `/components/inbody-modal.tsx` | **신규** — 인바디 입력 모달 컴포넌트 |
