CREATE TABLE inbody_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    weight DECIMAL(5,2) NOT NULL,
    skeletal_muscle_mass DECIMAL(5,2) NOT NULL,
    body_fat_percentage DECIMAL(5,2) NOT NULL,
    record_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inbody_records_user_challenge ON inbody_records(user_id, challenge_id);
CREATE INDEX idx_inbody_records_record_date ON inbody_records(record_date);

CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    goal_type_id UUID NOT NULL REFERENCES goal_types(id),
    target_value DECIMAL(5,2) NOT NULL,
    start_value DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_goals_user_challenge ON user_goals(user_id, challenge_id);
CREATE UNIQUE INDEX idx_user_goals_unique ON user_goals(user_id, challenge_id, goal_type_id);
