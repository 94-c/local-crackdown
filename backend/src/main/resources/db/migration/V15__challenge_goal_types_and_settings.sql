-- Add duration and inbody frequency settings to challenges
ALTER TABLE challenges ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 28;
ALTER TABLE challenges ADD COLUMN inbody_frequency_days INTEGER NOT NULL DEFAULT 7;

-- Junction table: challenges ↔ goal_types (many-to-many)
CREATE TABLE challenge_goal_types (
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    goal_type_id UUID NOT NULL REFERENCES goal_types(id) ON DELETE CASCADE,
    PRIMARY KEY (challenge_id, goal_type_id)
);
