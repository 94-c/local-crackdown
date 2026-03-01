-- Enhancement 1: 챌린지 초대 코드
ALTER TABLE challenges ADD COLUMN invite_code VARCHAR(8) UNIQUE;
UPDATE challenges SET invite_code = substr(md5(random()::text), 1, 8) WHERE invite_code IS NULL;
ALTER TABLE challenges ALTER COLUMN invite_code SET NOT NULL;

-- Enhancement 2: 인바디 체지방량(kg) 추가
ALTER TABLE inbody_records ADD COLUMN body_fat_mass DECIMAL(5,2);

-- Enhancement 3: 유저 기초 정보
ALTER TABLE users ADD COLUMN gender VARCHAR(10);
ALTER TABLE users ADD COLUMN birth_date DATE;
ALTER TABLE users ADD COLUMN height DECIMAL(5,1);
