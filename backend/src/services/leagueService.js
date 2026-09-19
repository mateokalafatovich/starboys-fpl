import { getStandingsData, getCurrentGameweek } from '../fpl/fplClient.js';
import { syncUsers } from './userService.js';
import { db } from '../config/db.js';
import { cacheService } from '../config/redis.js';

const LEAGUE_ID = process.env.LEAGUE_ID;
const STANDINGS_TTL = 60; // seconds

// CACHING SERVICES
/**
 * Function to build the cache key for the league standings.
 * @param {string} leagueId - The FPL league ID
 * @returns {string} - The cache key for the league standings
 */
function buildStandingsCacheKey(leagueId) {
    return `league:${leagueId}:standings`;
}

/**
 * Function to build the cache key for the league standings progression.
 * @param {string} leagueId - The FPL league ID
 * @returns {string} - The cache key for the league standings progression
 */
function buildStandingsProgressionCacheKey(leagueId) {
    return `league:${leagueId}:progression`;
}

/**
 * Function to build the cache key for the league rankings progression.
 * @param {string} leagueId - The FPL league ID
 * @returns {string} - The cache key for the league rankings progression
 */
function buildRankingsProgressionCacheKey(leagueId) {
    return `league:${leagueId}:rankingsProgression`;
}

// TRANSFORMER FUNCTIONS - Functions that transform raw data into structured 
// formats suitable for further processing or analysis

/**
 * Function to parse raw standings data into a structured format.
 * @param {*} rawData - The raw standings data from the FPL API
 * @returns {Array} - The parsed and structured standings data
 */
function parseStandings(rawData) {
    // Parse standings data
    return rawData.standings.results.map((entry) => ({
        fplEntryId: entry.entry,
        managerName: entry.player_name,
        teamName: entry.entry_name,
        rank: entry.rank,
        rankChange: entry.rank - entry.last_rank,
        totalPoints: entry.total,
        gameweekPoints: entry.event_total
    }));
}

/**
 * Function to pivot raw progression rows into a structured format suitable
 * for charting or analysis.
 * @param {Array} rows - The raw progression rows from the database
 * @returns {Array} - The pivoted progression data, one object per gameweek 
 * with team names as keys
 */
function pivotProgression(rows) {
    const byGameweek = new Map();
    for (const row of rows) {
        if (!byGameweek.has(row.gameweek_id)) {
            byGameweek.set(row.gameweek_id, { gameweek: row.gameweek_id });
        }
        byGameweek.get(row.gameweek_id)[row.team_name] = row.total_points;
    }
    return Array.from(byGameweek.values()).sort((a, b) => a.gameweek - b.gameweek);
}

function pivotRankingsProgression(rows) {
    const byGameweek = new Map();
    for (const row of rows) {
        if (!byGameweek.has(row.gameweek_id)) {
            byGameweek.set(row.gameweek_id, { gameweek: row.gameweek_id });
        }
        byGameweek.get(row.gameweek_id)[row.team_name] = row.league_rank;
        
    }
    return Array.from(byGameweek.values()).sort((a, b) => a.gameweek - b.gameweek);
}

// SQLite querying - Functions and prepared statements for interacting with the SQLite database

// Prepared statement to insert or update a gameweek score for a manager
const upsertScore = db.prepare(`
    INSERT INTO gameweek_scores 
        (fpl_id, gameweek_id, points, total_points, league_rank, rank_change)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (fpl_id, gameweek_id)
    DO UPDATE SET
        points = EXCLUDED.points,
        total_points = EXCLUDED.total_points,
        league_rank = EXCLUDED.league_rank,
        rank_change = EXCLUDED.rank_change,
        updated_at = CURRENT_TIMESTAMP   
`);

// Pulls every gameweek's total_points for every manager, joined against the
// users table so we can label each series by team name.
// This is used to build the progression of standings over time.
const getProgressionRows = db.prepare(`
    SELECT gs.gameweek_id, gs.total_points, u.team_name
    FROM gameweek_scores gs
    JOIN users u on U.fpl_id = gs.fpl_id
    WHERE gs.gameweek_id <= ?
    ORDER BY gs.gameweek_id ASC
`);

// Pulls every gameweek's league rank for every manager, joined against the
// users table so we can label each series by team name.
// This is used to build the progression of league rankings over time.
const getRankingsProgressionRows = db.prepare(`
    SELECT gs.gameweek_id, gs.league_rank, u.team_name
    FROM gameweek_scores gs
    JOIN users u on u.fpl_id = gs.fpl_id
    WHERE gs.gameweek_id <= ?
    ORDER BY gs.gameweek_id ASC
`);

/**
 * Function to persist the standings for a specific gameweek into the database.
 * @param {number} gameweekId - The ID of the gameweek for which to persist standings
 * @param {Array} standings - The array of standings to persist
 */
async function persistStandings(gameweekId, standings) {
    const upsertMany = db.transaction((rows) => {
        for (const s of rows) {
            upsertScore.run(
                s.fplEntryId, gameweekId, s.gameweekPoints, 
                s.totalPoints, s.rank, s.rankChange 
            );
        }
    });
    upsertMany(standings);
}

// SERVICES - Functions that provide higher-level operations for interacting 
// with league data

/**
 * Fetch the current standings for a given league.
 * @param {string} leagueId - The FPL league ID
 * @returns {Promise<Array>} - The current league standings
 */
async function getLeagueStandings(leagueId=LEAGUE_ID) {
    const cacheKey = buildStandingsCacheKey(leagueId);
    return cacheService.getOrSet(cacheKey, STANDINGS_TTL, async () => {
        const [rawData, gameweekId] = await Promise.all([
            getStandingsData(leagueId),
            getCurrentGameweek()
        ]);
        if (!rawData?.standings?.results) {
            throw new Error(`Invalid standings response for league ${leagueId}`);
        }
        const standings = parseStandings(rawData);
        await syncUsers(standings);
        await persistStandings(gameweekId, standings);
        return standings;
    });
}

/**
 * Fetch the progression of standings for a given league over time.
 * @param {string} leagueId - The FPL league ID
 * @returns {Promise<Array>} - The progression of league standings over time
 */
async function getStandingsProgression(leagueId=LEAGUE_ID) {
    const cacheKey = buildStandingsProgressionCacheKey(leagueId);
    return cacheService.getOrSet(cacheKey, STANDINGS_TTL, async() => {
        const gameweekId = await getCurrentGameweek();
        const rows = getProgressionRows.all(gameweekId);
        return pivotProgression(rows);
    });
}

/**
 * Fetch the progression of league rankings for a given league over time.
 * @param {string} leagueId - The FPL league ID
 * @returns {Promise<Array>} - The progression of league rankings over time
 */
async function getRankingsProgression(leagueId=LEAGUE_ID) {
    const cacheKey = buildRankingsProgressionCacheKey(leagueId);
    return cacheService.getOrSet(cacheKey, STANDINGS_TTL, async() => {
        const gameweekId = await getCurrentGameweek();
        const rows = getRankingsProgressionRows.all(gameweekId);
        return pivotRankingsProgression(rows);
    });
}

export { getLeagueStandings, getStandingsProgression, getRankingsProgression };