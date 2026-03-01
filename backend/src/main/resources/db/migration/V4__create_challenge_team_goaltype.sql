CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_week INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PREPARING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    member1_id UUID NOT NULL REFERENCES users(id),
    member2_id UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_challenge ON teams(challenge_id);

CREATE TABLE goal_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    description TEXT,
    direction_is_decrease BOOLEAN NOT NULL DEFAULT true
);

-- Seed goal types
INSERT INTO goal_types (name, unit, description, direction_is_decrease) VALUES
('체중 감량', 'kg', '목표 체중까지 감량', true),
('근육량 증가', 'kg', '골격근량 증가', false),
('체지방률 감소', '%', '체지방률 감소', true);
