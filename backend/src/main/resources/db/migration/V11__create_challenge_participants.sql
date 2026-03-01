CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);
