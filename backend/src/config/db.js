import Database from 'better-sqlite3';
import 'dotenv/config';

const db = new Database(process.env.DB_PATH || './data/app.db');

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

const query = (text, params = []) => {
    const statement = db.prepare(text);
    const command = text.trim().split(/\s+/)[0].toUpperCase();
    if (command === 'SELECT') {
        return { rows: statement.all(params) }
    } else {
        const info = statement.run(params);
        return { rows: [], ...info };
    }
};

export { query, db };