# 테스트 시나리오

## 사전 준비

```bash
# 1. Postgres + MinIO 실행
cd ~/local-crackdown
docker compose up -d postgres minio

# 2. Backend 실행
cd backend
cp .env.example .env
./gradlew bootRun

# 3. Frontend 실행 (새 터미널)
cd frontend
npm run dev
```

> 서버 시작 시 Admin 계정 자동 생성됨

## Admin 테스트 계정

| 항목 | 값 |
|------|---|
| 이메일 | `admin@challenge.com` |
| 비밀번호 | `admin1234!` |
| 역할 | ADMIN |
| 로그인 경로 | http://localhost:3000/admin/login |

---

## Auth 시나리오

### 시나리오 1: 일반 유저 회원가입
1. http://localhost:3000/signup 접속
2. 닉네임: `테스트유저`, 이메일: `test@test.com`, 비밀번호: `test1234!`
3. 비밀번호 확인 입력
4. 회원가입 버튼 클릭
5. **기대 결과**: /login 페이지로 이동

### 시나리오 2: 일반 유저 로그인
1. http://localhost:3000/login 접속
2. 이메일: `test@test.com`, 비밀번호: `test1234!`
3. 로그인 버튼 클릭
4. **기대 결과**: / (홈) 페이지로 이동, localStorage에 token 저장

### 시나리오 3: Admin 로그인
1. http://localhost:3000/admin/login 접속
2. 이메일: `admin@challenge.com`, 비밀번호: `admin1234!`
3. 관리자 로그인 버튼 클릭
4. **기대 결과**: /admin 페이지로 이동

### 시나리오 4: 회원가입 검증
1. /signup 접속
2. 비밀번호 8자 미만 입력
3. **기대 결과**: 에러 메시지 표시
4. 비밀번호와 확인이 다르게 입력
5. **기대 결과**: 에러 메시지 표시

### 시나리오 5: 로그인 실패
1. /login 접속
2. 잘못된 비밀번호 입력
3. **기대 결과**: "Invalid credentials" 에러 표시

### 시나리오 6: API 직접 테스트 (curl)

```bash
# Health check
curl http://localhost:8080/api/health

# 회원가입
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"test1234!","nickname":"유저1"}'

# 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"test1234!"}'

# Admin 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@challenge.com","password":"admin1234!"}'

# 내 정보 조회 (JWT 토큰 필요)
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer {위에서 받은 accessToken}"

# Admin 전용 API 접근 테스트 (USER 토큰으로 → 403)
curl http://localhost:8080/api/admin/test \
  -H "Authorization: Bearer {USER의 accessToken}"
# 기대 결과: 403 Forbidden
```

---

## Sprint별 시나리오 (구현 후 추가 예정)

### Sprint 1: 챌린지 + 팀 관리
- [ ] Admin이 챌린지 생성
- [ ] Admin이 팀 구성 (2인 1팀 배정)
- [ ] 유저가 본인 팀 확인

### Sprint 2: 온보딩 + 인바디
- [ ] 유저 최초 접속 시 온보딩 진입
- [ ] 인바디 입력 + 목표 설정
- [ ] 달성률 실시간 확인

### Sprint 3: 팀 미션
- [ ] 팀원이 주간 미션 입력
- [ ] 미션 인증 업로드 (이미지)
- [ ] 팀 미션 진행률 확인

### Sprint 4: 주간 마감
- [ ] Admin이 Close Week 실행
- [ ] 순위 확인
- [ ] 하위 2팀 확인

### Sprint 5: 벌칙 미션
- [ ] 룰렛으로 벌칙 미션 배정
- [ ] 벌칙 미션 인증 + Admin 승인
- [ ] 최종 순위 확인
