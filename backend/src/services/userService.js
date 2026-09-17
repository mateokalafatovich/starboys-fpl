import { db } from '../config/db.js';

const upsertUser = db.prepare(`
    INSERT INTO users (fpl_id, manager_name, team_name)
    VALUES (?, ?, ?)
    ON CONFLICT (fpl_id)
    DO UPDATE SET
        manager_name = EXCLUDED.manager_name,
        team_name = EXCLUDED.team_name
`);

/**
 * Upsert managers into the users table
 * @param {Array} managers - parsed standings entries
 */
async function syncUsers(managers) {
    const upsertMany = db.transaction((rows) => {
        for (const m of rows) {
            upsertUser.run(m.fplEntryId, m.managerName, m.teamName);
        }
    });
    upsertMany(managers);
}

export { 
    syncUsers 
};