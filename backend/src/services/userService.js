import { pool } from '../config/db.js';

/**
 * Upsert managers into the users table
 * @param {Array} entries - raw entries from FPL standings API
 */
async function syncUsers(managers) {
    const queries = managers.map((m) => {
        pool.query(
            `INSERT INTO users 
                (fpl_id, manager_name, team_name)
            VALUES ($1, $2, $3)
            ON CONFLICT (fpl_id)
            DO UPDATE SET
                manager_name = EXCLUDED.manager_name,
                team_name = EXCLUDED.team_name`,
            [m.fplEntryId, m.managerName, m.teamName]
        )
    });
    await Promise.all(queries);
}

export { 
    syncUsers 
};