import Database from 'better-sqlite3';

const db: Database.Database = new Database('./database.db', {
    // verbose: console.log,
});

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

/**
 * Health Check Function
 */
export const checkDbReady = (): boolean => {
    try {
        const result = db.prepare('SELECT 1').get();
        return !!result;
    } catch (error) {
        console.error('Database Health Check Failed:', error);
        return false;
    }
};

export default db;