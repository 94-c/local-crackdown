-- Sprint 5: 벌칙 미션 + 시즌 종료
CREATE TABLE penalty_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    week_number INT NOT NULL,
    mission_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(challenge_id, team_id, week_number)
);

CREATE TABLE penalty_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    penalty_mission_id UUID NOT NULL REFERENCES penalty_missions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    memo TEXT,
    image_url TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE final_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    total_score DECIMAL NOT NULL DEFAULT 0,
    final_rank INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(challenge_id, team_id)
);
