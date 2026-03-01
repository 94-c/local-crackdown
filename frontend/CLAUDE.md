# Frontend — Next.js + TypeScript

## Tech
- Next.js 15.2.1, React 19, TypeScript 5.9
- Tailwind CSS v4 (PostCSS plugin: @tailwindcss/postcss)
- PWA (manifest.json + service worker)
- App Router (src/app/), standalone output

## Project Structure
```
src/
├── app/
│   ├── layout.tsx           # 루트 레이아웃 (PWA 메타, lang="ko")
│   ├── page.tsx             # 랜딩 (/) — 로그인 상태별 리다이렉트
│   ├── globals.css          # Tailwind 글로벌 스타일
│   ├── login/page.tsx       # 유저 로그인
│   ├── signup/page.tsx      # 유저 회원가입
│   │
│   ├── (user)/              # 유저 Route Group (UserGuard + 하단 탭바)
│   │   ├── layout.tsx       # 헤더("지방단속") + UserNav + UserGuard
│   │   ├── user-guard.tsx   # 토큰 존재 확인 (ADMIN도 접근 허용)
│   │   ├── user-nav.tsx     # 하단 탭바: 홈, 팀, 인증, 결과, 내정보
│   │   ├── home/page.tsx    # 홈 대시보드 (팀정보, 달성률, 주간결과)
│   │   ├── onboarding/page.tsx  # 온보딩 3단계 (인바디→목표→완료)
│   │   ├── profile/page.tsx # 내정보 (달성률, 인바디기록, 입력폼)
│   │   ├── team/page.tsx    # 팀 미션 (생성/진행률/인증목록)
│   │   ├── verify/page.tsx  # 미션 인증 등록
│   │   └── result/page.tsx  # 주간 결과
│   │
│   └── admin/               # Admin Route Group (AdminGuard + 상단 네비)
│       ├── layout.tsx       # AdminGuard + AdminNav
│       ├── admin-guard.tsx  # ADMIN role 확인
│       ├── admin-nav.tsx    # 상단 네비 (7개 메뉴 + 사용자화면/로그아웃)
│       ├── login/page.tsx   # Admin 로그인
│       ├── page.tsx         # Admin 대시보드
│       ├── challenges/page.tsx   # 챌린지 관리
│       ├── users/page.tsx        # 사용자 관리
│       ├── teams/page.tsx        # 팀 관리
│       ├── weekly-close/page.tsx # 주간 마감
│       ├── rankings/page.tsx     # 순위표
│       └── missions/page.tsx     # 미션/벌칙/최종순위
│
├── components/
│   └── service-worker-register.tsx  # PWA SW 등록
│
└── lib/
    ├── api-client.ts    # fetch wrapper (JWT 자동 첨부, 에러 처리)
    ├── auth.ts          # parseJwtPayload, getRoleFromToken, isAdmin, getToken, logout
    └── types.ts         # 공유 TypeScript 인터페이스 (13개)
```

## TypeScript Types (lib/types.ts)
- Challenge, Team, UserInfo, GoalType
- InBodyRecord, UserGoal, Achievement
- MissionTemplate, TeamMission, Verification
- WeeklyResult, UserWeeklyResult
- PenaltyMission, PenaltyVerification, FinalScoreResult

## Pages Summary (총 18개)

### Public (인증 불필요)
| 경로 | 설명 |
|------|------|
| `/` | 랜딩 — 로그인 상태별 자동 리다이렉트 |
| `/login` | 유저 로그인 (이메일+비밀번호) |
| `/signup` | 유저 회원가입 |
| `/admin/login` | Admin 로그인 |

### User (하단 탭바, UserGuard)
| 경로 | 설명 |
|------|------|
| `/home` | 홈 대시보드 (팀정보, 달성률, 주간결과 카드) |
| `/onboarding` | 온보딩 (인바디 입력 → 목표 설정 → 완료) |
| `/profile` | 내정보 (달성률, 인바디 기록, 새 기록 입력) |
| `/team` | 팀 미션 (생성, 진행률 업데이트, 인증 목록) |
| `/verify` | 미션 인증 등록 + 인증 기록 조회 |
| `/result` | 주간 결과 조회 |

### Admin (상단 네비, AdminGuard)
| 경로 | 설명 |
|------|------|
| `/admin` | 대시보드 |
| `/admin/challenges` | 챌린지 CRUD |
| `/admin/users` | 사용자 목록 |
| `/admin/teams` | 팀 구성/관리 |
| `/admin/weekly-close` | 주간 마감 실행 |
| `/admin/rankings` | 주차별 순위표 |
| `/admin/missions` | 벌칙 미션 배정, 인증 승인, 최종 순위 |

## Coding Rules
- 페이지 컴포넌트: `src/app/{route}/page.tsx`
- 서버 컴포넌트 기본, 클라이언트 필요 시 `"use client"` 선언
- API 호출: `src/lib/api-client.ts`의 `apiClient` 사용
- 스타일: Tailwind utility class 사용, 모바일 퍼스트
- 한국어 UI (ko locale)
- 다크모드 지원 (dark: 클래스)

## Auth Flow
- 유저: `/login` → 이메일/비밀번호 → JWT 저장 (localStorage) → `/home`
- Admin: `/admin/login` → 이메일/비밀번호 → JWT 저장 → `/admin`
- 랜딩: 토큰 존재 시 role 확인 → ADMIN은 `/admin`, USER는 `/home`
- 로그아웃: `logout()` → localStorage 토큰 삭제 → `/login`

## Navigation
- USER: 하단 탭바 5개 (홈, 팀, 인증, 결과, 내정보)
- ADMIN: 상단 네비 7개 (대시보드, 챌린지, 사용자, 팀관리, 주간마감, 순위, 미션) + 사용자화면/로그아웃

## PWA
- `public/manifest.json` — 앱 매니페스트
- `public/sw.js` — 서비스 워커 (cache-first, v1)
- `src/components/service-worker-register.tsx` — SW 등록

## Static Assets
- `public/images/mascot.png` — 캐릭터 마스코트 (메인 화면)
- `public/images/logo.png` — 텍스트 로고 (Admin 헤더)

## Commands
```bash
npm install     # 의존성 설치
npm run dev     # 개발 서버 (localhost:3000)
npm run build   # 프로덕션 빌드
npm run lint    # ESLint 실행
```

## Environment
- `.env.local` (gitignore됨), `.env.example` 참조
- `NEXT_PUBLIC_API_URL` — 백엔드 API 주소 (기본: http://localhost:8080)
