# Frontend — Next.js + TypeScript

## Tech Stack

- Next.js 15.2.1 (App Router, standalone output)
- React 19 + TypeScript 5.9
- Tailwind CSS v4 (PostCSS plugin)
- PWA (manifest.json + service worker)

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

개발 서버: http://localhost:3000

## Commands

```bash
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버
npm run lint    # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (PWA, lang="ko")
│   ├── page.tsx                # 랜딩 — 로그인 상태별 리다이렉트
│   ├── globals.css             # Tailwind 글로벌 스타일
│   ├── login/page.tsx          # 유저 로그인
│   ├── signup/page.tsx         # 유저 회원가입
│   │
│   ├── (user)/                 # User Route Group
│   │   ├── layout.tsx          # 헤더 + 하단 탭바 + UserGuard
│   │   ├── user-guard.tsx      # 토큰 확인 (ADMIN도 접근 허용)
│   │   ├── user-nav.tsx        # 하단 탭바 (5개)
│   │   ├── home/page.tsx       # 홈 대시보드
│   │   ├── onboarding/page.tsx # 온보딩 3단계 위저드
│   │   ├── profile/page.tsx    # 내정보 + 인바디
│   │   ├── team/page.tsx       # 팀 미션
│   │   ├── verify/page.tsx     # 미션 인증
│   │   └── result/page.tsx     # 주간 결과
│   │
│   └── admin/                  # Admin Route Group
│       ├── layout.tsx          # AdminGuard + 상단 네비
│       ├── admin-guard.tsx     # ADMIN role 확인
│       ├── admin-nav.tsx       # 상단 네비 (7개 메뉴)
│       ├── login/page.tsx      # Admin 로그인
│       ├── page.tsx            # 대시보드
│       ├── challenges/page.tsx # 챌린지 관리
│       ├── users/page.tsx      # 사용자 관리
│       ├── teams/page.tsx      # 팀 관리
│       ├── weekly-close/page.tsx # 주간 마감
│       ├── rankings/page.tsx   # 순위표
│       └── missions/page.tsx   # 벌칙 미션 + 최종 순위
│
├── components/
│   └── service-worker-register.tsx
│
└── lib/
    ├── api-client.ts           # fetch wrapper (JWT 자동 첨부)
    ├── auth.ts                 # JWT 파싱, role 확인, 로그아웃
    └── types.ts                # 공유 TypeScript 인터페이스 (13개)
```

## Pages (총 18개)

### Public

| Path | Description |
|------|-------------|
| `/` | 랜딩 — 로그인 상태에 따라 자동 리다이렉트 |
| `/login` | 유저 로그인 (이메일 + 비밀번호) |
| `/signup` | 유저 회원가입 |
| `/admin/login` | Admin 로그인 |

### User (하단 탭바)

| Path | Description |
|------|-------------|
| `/home` | 홈 대시보드 (팀정보, 달성률, 주간결과) |
| `/onboarding` | 온보딩 (인바디 → 목표설정 → 완료) |
| `/profile` | 내정보 (달성률, 인바디 기록, 입력) |
| `/team` | 팀 미션 생성/진행률/인증 목록 |
| `/verify` | 미션 인증 등록 + 기록 조회 |
| `/result` | 주간 결과 |

### Admin (상단 네비)

| Path | Description |
|------|-------------|
| `/admin` | 대시보드 |
| `/admin/challenges` | 챌린지 CRUD |
| `/admin/users` | 사용자 목록 |
| `/admin/teams` | 팀 구성/관리 |
| `/admin/weekly-close` | 주간 마감 실행 |
| `/admin/rankings` | 주차별 순위표 |
| `/admin/missions` | 벌칙 미션 배정, 인증 승인, 최종 순위 |

## Auth Flow

1. **유저 로그인**: `/login` → JWT → localStorage → `/home`
2. **Admin 로그인**: `/admin/login` → JWT → localStorage → `/admin`
3. **랜딩 리다이렉트**: 토큰 있으면 role 확인 → ADMIN은 `/admin`, USER는 `/home`
4. **로그아웃**: localStorage 토큰 삭제 → `/login`

## Navigation

- **User**: 하단 탭바 5개 (홈, 팀, 인증, 결과, 내정보)
- **Admin**: 상단 네비 7개 (대시보드, 챌린지, 사용자, 팀관리, 주간마감, 순위, 미션) + 사용자화면 링크 + 로그아웃

## Static Assets

```
public/
├── manifest.json          # PWA 매니페스트
├── sw.js                  # Service Worker (cache-first, v1)
└── images/
    ├── mascot.png         # 캐릭터 마스코트 (메인 화면)
    └── logo.png           # 텍스트 로고 (Admin 헤더)
```

## Environment

`.env.example` 참조:

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | 백엔드 API 주소 | http://localhost:8080 |
