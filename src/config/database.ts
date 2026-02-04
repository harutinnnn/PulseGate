import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function initDB(): Promise<Database> {
    // This opens a file-based database.
    // If 'database.db' doesn't exist, it will be created automatically.
    return open({
        filename: './database.db',
        driver: sqlite3.Database
    });
}