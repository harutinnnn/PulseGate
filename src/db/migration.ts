import Database from 'better-sqlite3';
import path from "path";
import * as fs from "node:fs";
import logger from "../config/logger";

export const migrateDb = (db: Database.Database) => {

    const migrationFiles = fs.readdirSync(path.join(__dirname, 'migration-sql')).sort();

    migrationFiles.forEach((file) => {
        const filePath = path.join(path.join(__dirname, 'migration-sql', file));
        const sql = fs.readFileSync(filePath, 'utf-8');
        try {

            db.exec(sql)

        } catch (error: any) {
            logger.error(`Failed to apply migration ${file}: ${error.message}`);
            throw error;
        }
    })

}