import { getCurrentGameweek, getEntryHistory } from '../fpl/fplClient.js';
import { db } from '../config/db.js';

const GAMEWEEK = 4;
const GAMEWEEKS_TO_FILL = Array.from({ length: GAMEWEEK}, (_, index) => index+1);

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

async function fetchHistories(fplIds) {
    // { fplId: [{ event, points, total_points }, ...] }
    const historyByFplId = {};
    for (const fplId of fplIds) {
        const history = await getEntryHistory(fplId);
        historyByFplId[fplId] = history.current
            .filter((gw) => GAMEWEEKS_TO_FILL.includes(gw.event))
            .map((gw) => ({
                gameweek: gw.event,
                points: gw.points,
                totalPoints: gw.total_points
            }));
    }
    return historyByFplId;
}

function groupByGameweek(historyByFplId) {
    // { 1: [{ fplId, points, totalPoints }, ...], 2: [...], ... }
    const byGameweek = {};
    for (const gw of GAMEWEEKS_TO_FILL) {
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

function computeRanks(byGameweek) {
    // Adds league_rank per gameweek, sorted by totalPoints desc
    const ranked = {};
    for (const gw of GAMEWEEKS_TO_FILL) {
        const sorted = [...byGameweek[gw]].sort((a, b) => b.totalPoints - a.totalPoints);
        ranked[gw] = sorted.map((entry, i) => ({
            ...entry,
            leagueRank: i + 1
        }));
    }
    return ranked;
}

function computeRankChanges(ranked) {
    // Adds rank_change vs previous backfilled gameweek (0 for gameweek 1)
    const withChanges = {};
    for (const gw of GAMEWEEKS_TO_FILL) {
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

function persist(withChanges) {
    const insertMany = db.transaction((allRows) => {
        for (const row of allRows) {
            upsertScore.run(
                row.fplId, row.gameweek, row.points,
                row.totalPoints, row.leagueRank, row.rankChange
            );
        }
    });

    const allRows = GAMEWEEKS_TO_FILL.flatMap((gw) =>
        withChanges[gw].map((entry) => ({ ...entry, gameweek: gw }))
    );

    insertMany(allRows);
    return allRows.length;
}

async function main() {
    const fplIds = getFplIds();
    console.log(`Backfilling gameweeks ${GAMEWEEKS_TO_FILL.join(', ')} for ${fplIds.length} managers...`);

    const historyByFplId = await fetchHistories(fplIds);
    const byGameweek = groupByGameweek(historyByFplId);
    const ranked = computeRanks(byGameweek);
    const withChanges = computeRankChanges(ranked);
    const rowCount = persist(withChanges);

    console.log(`Done. Backfilled ${rowCount} rows.`);
}

main().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});