-- Mission Templates
CREATE TABLE mission_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    unit VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Team Missions
CREATE TABLE team_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    challenge_id UUID REFERENCES challenges(id),
    week_number INT NOT NULL,
    mission_template_id UUID REFERENCES mission_templates(id),
    target_value DECIMAL NOT NULL,
    current_value DECIMAL DEFAULT 0,
    status VARCHAR DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, challenge_id, week_number)
);

-- Mission Verifications
CREATE TABLE mission_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_mission_id UUID REFERENCES team_missions(id),
    user_id UUID REFERENCES users(id),
    image_url TEXT,
    memo TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed mission templates
INSERT INTO mission_templates (id, name, description, unit) VALUES
(gen_random_uuid(), '운동 횟수', '주간 운동 횟수 달성', '회'),
(gen_random_uuid(), '러닝 거리', '주간 러닝 거리 달성', 'km'),
(gen_random_uuid(), '식단 인증', '식단 사진 인증 횟수', '회'),
(gen_random_uuid(), '걸음 수', '일일 걸음 수 합계', '걸음');
