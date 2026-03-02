-- 피드 이벤트
CREATE TABLE feed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    user_id UUID NOT NULL REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    reference_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_feed_events_challenge_created ON feed_events(challenge_id, created_at DESC);

-- 응원 (좋아요)
CREATE TABLE feed_cheers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_event_id UUID NOT NULL REFERENCES feed_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (feed_event_id, user_id)
);
CREATE INDEX idx_feed_cheers_event ON feed_cheers(feed_event_id);

-- 푸시 구독
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, endpoint)
);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
