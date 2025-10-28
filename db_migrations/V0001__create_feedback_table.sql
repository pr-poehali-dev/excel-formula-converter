CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    is_positive BOOLEAN NOT NULL,
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);