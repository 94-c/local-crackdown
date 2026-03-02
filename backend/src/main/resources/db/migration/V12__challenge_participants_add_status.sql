ALTER TABLE challenge_participants ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
CREATE INDEX idx_challenge_participants_status ON challenge_participants(challenge_id, status);
