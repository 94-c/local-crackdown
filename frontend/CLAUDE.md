# Frontend — Next.js + TypeScript

## SuperClaude Skills (Frontend Superpowers)

### 권장 스킬
| 스킬 | 용도 | 예시 |
|------|------|------|
| `/sc:build` | Next.js 빌드 검증 | `npm run build` 실행 및 타입 에러 분석 |
| `/sc:troubleshoot` | 빌드/런타임 에러 진단 | TypeScript 에러, hydration 불일치, API 연결 문제 |
| `/sc:implement` | 페이지/컴포넌트 구현 | 새 페이지, 모달, 폼 생성 |
| `/sc:analyze` | 코드 품질 분석 | 접근성, 성능, 번들 사이즈 점검 |
| `/sc:improve` | UX/코드 개선 | 로딩 상태, 에러 처리, 반응형 개선 |
| `/sc:design` | UI/컴포넌트 설계 | 화면 구조, 컴포넌트 분리, 상태 관리 설계 |
| `/sc:cleanup` | 미사용 코드 제거 | 미사용 import, 중복 컴포넌트 정리 |
| `/sc:test` | 테스트 | Lint 실행, 빌드 타입 체크 |

### 빌드 명령어
```bash
npm run build    # 프로덕션 빌드 (필수 — 모든 변경 후 실행)
npm run dev      # 개발 서버 (localhost:3000)
npm run lint     # ESLint 실행
```

## Tech
- Next.js 15.2.1, React 19, TypeScript 5.9
- Tailwind CSS v4 (PostCSS plugin: @tailwindcss/postcss)
- PWA (manifest.json + service worker)
- App Router (src/app/), standalone output
- recharts (인바디 차트)

## Project Structure
```
src/
├── app/
│   ├── layout.tsx            # 루트 레이아웃 (PWA 메타, lang="ko")
│   ├── page.tsx              # 랜딩 (/) — 로그인 상태별 리다이렉트
│   ├── globals.css           # Tailwind 글로벌 스타일
│   ├── login/page.tsx        # 유저 로그인
│   ├── signup/page.tsx       # 유저 회원가입
│   ├── join/[code]/page.tsx  # 초대 링크 랜딩
│   │
│   ├── (user)/               # 유저 Route Group (UserGuard + 하단 탭바)
│   │   ├── layout.tsx        # 헤더 + UserNav + UserGuard
│   │   ├── user-guard.tsx    # 토큰 확인
│   │   ├── user-nav.tsx      # 하단 탭바 6개 (홈, 팀, 인증, 알림, 결과, 내정보)
│   │   ├── home/page.tsx     # 홈 대시보드 (카운트다운, 온보딩 모달)
│   │   ├── onboarding/page.tsx  # 온보딩 위저드
│   │   ├── profile/page.tsx  # 내정보 (달성률, 인바디 차트/기록, 삭제)
│   │   ├── team/page.tsx     # 팀 미션 (동적 주차)
│   │   ├── verify/page.tsx   # 미션 인증 (이미지 업로드)
│   │   ├── result/page.tsx   # 주간 결과
│   │   ├── feed/page.tsx     # 피드
│   │   └── notifications/page.tsx  # 알림
│   │
│   └── admin/                # Admin Route Group (AdminGuard + 상단 네비)
│       ├── layout.tsx        # AdminGuard + AdminNav
│       ├── admin-guard.tsx   # ADMIN role 확인
│       ├── admin-nav.tsx     # 상단 네비 (8개 메뉴)
│       ├── login/page.tsx    # Admin 로그인
│       ├── page.tsx          # Admin 대시보드
│       ├── challenges/page.tsx      # 챌린지 관리 (생성/삭제/초대링크)
│       ├── challenges/[id]/page.tsx # 챌린지 상세 (수정/개인현황/팀현황)
│       ├── participants/page.tsx    # 참여자 승인/거절
│       ├── users/page.tsx           # 사용자 관리 (삭제)
│       ├── teams/page.tsx           # 팀 관리 (자동배정/검색)
│       ├── weekly-close/page.tsx    # 주간 마감
│       ├── rankings/page.tsx        # 순위표
│       └── missions/page.tsx        # 벌칙 미션 (룰렛)/최종순위
│
├── components/               # 17개 컴포넌트
│   ├── ui/                   # 공통 UI (Spinner, Skeleton, Alert, Toast, ProgressBar 등)
│   ├── InBodyModal.tsx       # 인바디 입력 모달
│   ├── InBodyChart.tsx       # 인바디 차트 (recharts)
│   ├── OnboardingModal.tsx   # 온보딩 3단계 모달
│   ├── RouletteWheel.tsx     # 벌칙 룰렛 (Canvas)
│   ├── UserSearchDropdown.tsx # 유저 검색 드롭다운
│   ├── service-worker-register.tsx
│   └── push-notification-register.tsx
│
└── lib/
    ├── api-client.ts    # fetch wrapper (JWT 자동 첨부, 에러 처리, 401 리다이렉트)
    ├── auth.ts          # parseJwtPayload, getRoleFromToken, isAdmin, getToken, logout
    ├── types.ts         # 공유 TypeScript 인터페이스
    └── validation.ts    # 입력 유효성 검증
```

## Pages Summary (총 22개)

### Public (인증 불필요)
| 경로 | 설명 |
|------|------|
| `/` | 랜딩 — 로그인 상태별 자동 리다이렉트 |
| `/login` | 유저 로그인 |
| `/signup` | 유저 회원가입 |
| `/join/[code]` | 초대 링크 랜딩 → 참여 신청 |
| `/admin/login` | Admin 로그인 |

### User (하단 탭바, UserGuard)
| 경로 | 설명 |
|------|------|
| `/home` | 홈 대시보드 (카운트다운, 주간결과, 달성률, 온보딩 모달) |
| `/onboarding` | 온보딩 (프로필→인바디→목표→완료) |
| `/profile` | 내정보 (달성률, 인바디 차트/기록/삭제) |
| `/team` | 팀 미션 (동적 주차, 생성/진행률/인증목록) |
| `/verify` | 미션 인증 (이미지 업로드, 미리보기) |
| `/result` | 주간 결과 |
| `/feed` | 피드 |
| `/notifications` | 알림 (읽음처리, 미읽음 뱃지) |

### Admin (상단 네비, AdminGuard)
| 경로 | 설명 |
|------|------|
| `/admin` | 대시보드 |
| `/admin/challenges` | 챌린지 CRUD + 초대링크 |
| `/admin/challenges/[id]` | 챌린지 상세 (수정, 개인현황/팀현황 탭) |
| `/admin/participants` | 참여 승인/거절/일괄승인 |
| `/admin/users` | 사용자 관리 (상세정보, 삭제) |
| `/admin/teams` | 팀 관리 (생성/삭제/자동배정) |
| `/admin/weekly-close` | 주간 마감 |
| `/admin/rankings` | 순위표 |
| `/admin/missions` | 벌칙 미션 (룰렛)/인증 승인/최종 순위 |

## Coding Rules
- 페이지: `src/app/{route}/page.tsx`
- 서버 컴포넌트 기본, 클라이언트 시 `"use client"` 선언
- API 호출: `apiClient` 사용 (lib/api-client.ts)
- 스타일: Tailwind utility class, 모바일 퍼스트
- 한국어 UI (ko locale), 다크모드 지원 (dark: 클래스)
- 새 타입 추가 시 `lib/types.ts`에 정의
- 공통 UI는 `components/ui/` 사용 (Spinner, LoadingSkeleton, ErrorAlert, EmptyState, ProgressBar, Toast)
- 삭제 동작은 confirm() 확인 필수
- 이미지 업로드: presigned URL → MinIO PUT → fileUrl 저장

## Auth Flow
- 유저: `/login` → JWT 저장 (localStorage) → `/home`
- Admin: `/admin/login` → JWT 저장 → `/admin`
- 랜딩: 토큰 존재 → role 확인 → ADMIN은 `/admin`, USER는 `/home`
- 로그아웃: `logout()` → 토큰 삭제 → `/login`
- 초대: `/join/[code]` → 로그인 후 참여 → 온보딩

## Navigation
- USER: 하단 탭바 6개 (홈, 팀, 인증, 알림, 결과, 내정보)
- ADMIN: 상단 네비 8개 (대시보드, 챌린지, 참여자, 사용자, 팀관리, 주간마감, 순위, 미션) + 사용자화면/로그아웃

## Environment
- `.env.local` (gitignore됨)
- `NEXT_PUBLIC_API_URL` — 백엔드 API 주소 (기본: http://localhost:8080)
