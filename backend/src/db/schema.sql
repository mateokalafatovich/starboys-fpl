-- Store all Starboys mini-league members
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fpl_id INTEGER NOT NULL UNIQUE,
    manager_name TEXT NOT NULL,
    team_name TEXT NOT NULL
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Stores weekly progress of mini-league
CREATE TABLE IF NOT EXISTS gameweek_scores (
    id INTEGER PRIMARY KEY,
    fpl_id INTEGER NOT NULL UNIQUE REFERENCES users(fpl_id),
    gameweek_id INTEGER NOT NULL UNIQUE,
    points INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    rank_change INTEGER NOT NULL,
    overall_rank INTEGER NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);