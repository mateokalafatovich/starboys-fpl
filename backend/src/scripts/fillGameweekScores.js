import { getCurrentGameweek, getEntryHistory } from '../fpl/fplClient.js';
import { db } from '../config/db.js';

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

function getFplIds() {
    const rows = db.prepare('SELECT DISTINCT fpl_id FROM gameweek_scores').all();
    return rows.map((r) => r.fpl_id);
}

async function fetchHistories(fplIds, gameweeksToFill) {
    // { fplId: [{ event, points, total_points }, ...] }
    const historyByFplId = {};
    for (const fplId of fplIds) {
        const history = await getEntryHistory(fplId);
        historyByFplId[fplId] = history.current
            .filter((gw) => gameweeksToFill.includes(gw.event))
            .map((gw) => ({
                gameweek: gw.event,
                points: gw.points,
                totalPoints: gw.total_points
            }));
    }
    return historyByFplId;
}

function groupByGameweek(historyByFplId, gameweeksToFill) {
    // { 1: [{ fplId, points, totalPoints }, ...], 2: [...], ... }
    const byGameweek = {};
    for (const gw of gameweeksToFill) {
        byGameweek[gw] = [];
    }
    for (const [fplId, entries] of Object.entries(historyByFplId)) {
        for (const entry of entries) {
            byGameweek[entry.gameweek].push({
                fplId: Number(fplId),
                points: entry.points,
                totalPoints: entry.totalPoints
            });
        }
    }
    return byGameweek;
}

function computeRanks(byGameweek, gameweeksToFill) {
    // Adds league_rank per gameweek, sorted by totalPoints desc
    const ranked = {};
    for (const gw of gameweeksToFill) {
        const sorted = [...byGameweek[gw]].sort((a, b) => b.totalPoints - a.totalPoints);
        ranked[gw] = sorted.map((entry, i) => ({
            ...entry,
            leagueRank: i + 1
        }));
    }
    return ranked;
}

function computeRankChanges(ranked, gameweeksToFill) {
    // Adds rank_change vs previous backfilled gameweek (0 for gameweek 1)
    const withChanges = {};
    for (const gw of gameweeksToFill) {
        const prevGw = gw - 1;
        const prevRanks = withChanges[prevGw];

        withChanges[gw] = ranked[gw].map((entry) => {
            if (!prevRanks) {
                return { ...entry, rankChange: 0 };
            }
            const prevEntry = prevRanks.find((p) => p.fplId === entry.fplId);
            const rankChange = prevEntry ? prevEntry.leagueRank - entry.leagueRank : 0;
            return { ...entry, rankChange };
        });
    }
    return withChanges;
}

function persist(withChanges, gameweeksToFill) {
    const insertMany = db.transaction((allRows) => {
        for (const row of allRows) {
            upsertScore.run(
                row.fplId, row.gameweek, row.points,
                row.totalPoints, row.leagueRank, row.rankChange
            );
        }
    });

    const allRows = gameweeksToFill.flatMap((gw) =>
        withChanges[gw].map((entry) => ({ ...entry, gameweek: gw }))
    );

    insertMany(allRows);
    return allRows.length;
}

async function resolveGameweek() {
    if (process.argv[2] !== undefined) {
        return Number(process.argv[2]);
    }
    return getCurrentGameweek();
}

async function main() {
    const GAMEWEEK = await resolveGameweek();
    const GAMEWEEKS_TO_FILL = Array.from({ length: GAMEWEEK }, (_, index) => index + 1);

    const fplIds = getFplIds();
    console.log(`Backfilling gameweeks ${GAMEWEEKS_TO_FILL.join(', ')} for ${fplIds.length} managers...`);

    const historyByFplId = await fetchHistories(fplIds, GAMEWEEKS_TO_FILL);
    const byGameweek = groupByGameweek(historyByFplId, GAMEWEEKS_TO_FILL);
    const ranked = computeRanks(byGameweek, GAMEWEEKS_TO_FILL);
    const withChanges = computeRankChanges(ranked, GAMEWEEKS_TO_FILL);
    const rowCount = persist(withChanges, GAMEWEEKS_TO_FILL);

    console.log(`Done. Backfilled ${rowCount} rows.`);
}

main().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
