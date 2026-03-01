# Frontend — Next.js + TypeScript

## Tech
- Next.js 15.2.1, React 19, TypeScript 5.7
- Tailwind CSS v4 (PostCSS plugin: @tailwindcss/postcss)
- PWA (manifest.json + service worker)
- App Router (src/app/)

## Project Structure
```
src/
├── app/                 # App Router 페이지
│   ├── layout.tsx       # 루트 레이아웃
│   ├── page.tsx         # 홈 (/)
│   ├── login/           # 카카오 로그인
│   ├── onboarding/      # 최초 참여 (인바디 + 목표 설정)
│   ├── team/            # 팀 미션/현황
│   ├── verify/          # 미션 인증 업로드
│   ├── profile/         # 내정보
│   ├── result/          # 주간 결과
│   └── admin/           # Admin 페이지 그룹
│       ├── login/
│       ├── page.tsx     # 대시보드
│       ├── weekly-close/
│       ├── rankings/
│       ├── missions/
│       ├── users/
│       └── challenges/
├── components/          # 공유 컴포넌트
└── lib/                 # 유틸리티
    └── api-client.ts    # API fetch wrapper (JWT 자동 첨부)
```

## Coding Rules
- 페이지 컴포넌트: `src/app/{route}/page.tsx`
- 서버 컴포넌트 기본, 클라이언트 필요 시 `"use client"` 선언
- API 호출: `src/lib/api-client.ts`의 `apiClient` 사용
- 스타일: Tailwind utility class 사용, 모바일 퍼스트
- 한국어 UI (ko locale)

## Auth Flow
- 유저: `/login` → 카카오 OAuth 리다이렉트 → callback → JWT 저장 (localStorage)
- Admin: `/admin/login` → 이메일/비밀번호 → JWT 저장

## Navigation
- USER: Bottom Tab Bar (홈, 팀, 인증, 내정보)
- ADMIN: Top/Side navigation

## PWA
- `public/manifest.json` — 앱 매니페스트
- `public/sw.js` — 서비스 워커
- `src/components/service-worker-register.tsx` — SW 등록

## Commands
```bash
npm install     # 의존성 설치
npm run dev     # 개발 서버 (localhost:3000)
npm run build   # 프로덕션 빌드
npm run lint    # ESLint 실행
```

## Environment
- `.env.local` (gitignore됨), `.env.example` 참조
- `NEXT_PUBLIC_API_URL` — 백엔드 API 주소
