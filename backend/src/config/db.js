import 'dotenv/config';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join, isAbsolute } from 'path';
import { existsSync, mkdirSync, readFileSync } from 'fs';

// Determine the directory name of the current module file
const __dirname = dirname(fileURLToPath(import.meta.url));

// Determine the path to the SQLite database file
const rawPath = process.env.DB_PATH || './data/app.db';
const dbPath = rawPath === ':memory:'
    ? rawPath
    : isAbsolute(rawPath)
        ? rawPath
        : join(__dirname, '../../', rawPath);

// Ensure the directory for the SQLite database exists if it's not in-memory
if (dbPath !== ':memory:') {
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
    }
}

// Initialize the SQLite database connection
const db = new Database(dbPath);

// Configure SQLite pragmas for foreign key support and write-ahead logging
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Load and execute the database schema
const schemaPath = join(__dirname, '../db/schema.sql');
const schema = readFileSync(schemaPath, 'utf8');

// Execute the schema SQL to set up the database tables and initial data
try {
    db.exec(schema);
    console.log(`SQLite database initialized: ${dbPath}`);
} catch(err) {
    console.error('Failed to initialize database:', err);
}

// Define a helper function to execute SQL queries against the database
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