-- Store all Starboys mini-league members
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    fpl_id INT UNIQUE NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stores weekly progress of mini-league
CREATE TABLE IF NOT EXISTS gameweek_scores (
    id SERIAL PRIMARY KEY,
    fpl_id INT NOT NULL REFERENCES users(fpl_id),
    gameweek_id INT NOT NULL ,
    points INT NOT NULL,
    total_points INT NOT NULL,
    league_rank INT NOT NULL,
    rank_change INT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_manager_week UNIQUE (fpl_id, gameweek_id)
);