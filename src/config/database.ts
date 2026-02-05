import {open, Database} from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path'

import logger from "./logger";

export default async function initDB(): Promise<Database | null> {

    try {
        const db = await open({
            filename: path.resolve('database.db'),
            driver: sqlite3.Database,
            mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
        })


        logger.info('✅ SQLite database connected');
        return db
    } catch (err: any) {

        logger.error('❌ Database connection failed:'+ err.message);
        return null
    }
}