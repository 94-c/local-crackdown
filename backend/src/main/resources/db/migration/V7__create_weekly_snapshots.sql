CREATE TABLE weekly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  week_number INT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  team_id UUID NOT NULL REFERENCES teams(id),
  achievement_rate DECIMAL NOT NULL DEFAULT 0,
  team_score DECIMAL NOT NULL DEFAULT 0,
  team_rank INT NOT NULL DEFAULT 0,
  is_bottom_team BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id, week_number, user_id)
);
CREATE INDEX idx_weekly_snapshots_challenge_week ON weekly_snapshots(challenge_id, week_number);
