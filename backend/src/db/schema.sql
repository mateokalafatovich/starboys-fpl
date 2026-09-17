-- Store all Starboys mini-league members
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fpl_id INTEGER UNIQUE NOT NULL,
    manager_name TEXT NOT NULL,
    team_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Stores weekly progress of mini-league
CREATE TABLE IF NOT EXISTS gameweek_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fpl_id INTEGER NOT NULL REFERENCES users(fpl_id),
    gameweek_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    total_points INTEGER NOT NULL,
    league_rank INTEGER NOT NULL,
    rank_change INTEGER NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT unique_manager_week UNIQUE (fpl_id, gameweek_id)
);