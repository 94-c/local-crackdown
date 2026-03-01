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

#### 시나리오 7: Admin 챌린지 생성 (UI)
1. http://localhost:3000/admin/login → admin@challenge.com / admin1234!
2. 대시보드 → "챌린지 관리" 클릭
3. "새 챌린지 만들기" 버튼 클릭
4. 챌린지 이름: `3월 챌린지`, 시작일/종료일 설정
5. **기대 결과**: 챌린지 목록에 "준비중" 배지와 함께 표시

#### 시나리오 8: Admin 팀 구성 (UI)
1. Admin 로그인 → "사용자/팀" 메뉴
2. 챌린지 선택 드롭다운에서 챌린지 선택
3. "새 팀 만들기" → 팀명, 멤버1 ID, 멤버2 ID 입력
4. **기대 결과**: 팀 목록에 팀원 정보와 함께 표시

#### 시나리오 9: API 직접 테스트 (curl)
```bash
# Admin 토큰 받기
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@challenge.com","password":"admin1234!"}' | jq -r '.accessToken')

# 챌린지 생성
curl -X POST http://localhost:8080/api/admin/challenges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"3월 챌린지","description":"첫 번째 챌린지","startDate":"2026-03-02","endDate":"2026-03-30"}'

# 챌린지 목록 조회
curl http://localhost:8080/api/admin/challenges \
  -H "Authorization: Bearer $TOKEN"

# 목표 유형 조회
curl http://localhost:8080/api/goal-types \
  -H "Authorization: Bearer $TOKEN"

# 팀 생성 (member1Id, member2Id는 실제 유저 UUID)
curl -X POST http://localhost:8080/api/admin/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"팀1","challengeId":"{챌린지UUID}","member1Id":"{유저1UUID}","member2Id":"{유저2UUID}"}'

# 내 팀 조회 (일반 유저 토큰으로)
curl http://localhost:8080/api/teams/me \
  -H "Authorization: Bearer $USER_TOKEN"
```

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
