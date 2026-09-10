import { getStandingsData, getCurrentGameweek } from '../fpl/fplClient.js';
import { syncUsers } from './userService.js';
import { pool } from '../config/db.js';
import { cacheService } from '../config/redis.js';

const LEAGUE_ID = process.env.LEAGUE_ID;
const STANDINGS_TTL = 60; // seconds

function buildStandingsCacheKey(leagueId) {
    return `league:${leagueId}:standings`;
}

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

async function persistStandings(gameweekId, standings) {
    const queries = standings.map((s) => 
        pool.query(
            `INSERT INTO gameweek_scores 
                (fpl_id, gamweek_id, points, total_points, league_rank, rank_change)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (fpl_id, gameweek_id)
            DO UPDATE SET
                points = EXCLUDED.points,
                total_points = EXCLUDED.total_points,
                league_rank = EXCLUDED.league_rank,
                rank_change = EXCLUDED.rank_change,
                updated_at = NOW()`,
            [s.fplEntryId, gameweekId, s.gameweekPoints, s.totalPoints, s.rank, s.rankChange]
        )
    );
}

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

export { getLeagueStandings };