CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT,
    repo_prefix TEXT,
    admin BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_users ON users(email);
CREATE INDEX IF NOT EXISTS idx_users2 ON users(repo_prefix);

CREATE TABLE IF NOT EXISTS tokens (
    email TEXT,
    token TEXT,
    -- pending, validated
    status TEXT
);

CREATE INDEX IF NOT EXISTS idx_tokens ON tokens(email);
CREATE INDEX IF NOT EXISTS idx_tokens2 ON tokens(token, status);

CREATE TABLE IF NOT EXISTS builds (
    id SERIAL PRIMARY KEY,
    email TEXT,
    submitted_at TIMESTAMP,
    repo_name TEXT,
    file_name TEXT,
    upload_path TEXT,
    -- created, started
    status TEXT,
    error TEXT,
    link TEXT
);

CREATE INDEX IF NOT EXISTS idx_builds ON builds(id);
CREATE INDEX IF NOT EXISTS idx_builds2 ON builds(email);
CREATE INDEX IF NOT EXISTS idx_builds3 ON builds(email, repo_name);
CREATE INDEX IF NOT EXISTS idx_builds4 ON builds(email, submitted_at);
CREATE INDEX IF NOT EXISTS idx_builds5 ON builds(email, repo_name, submitted_at);

CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE INDEX IF NOT EXISTS idx_meta ON meta(key);

INSERT INTO meta VALUES ('version', '1.0.0') ON CONFLICT DO NOTHING;
INSERT INTO meta VALUES ('initialized', 'true') ON CONFLICT DO NOTHING;
