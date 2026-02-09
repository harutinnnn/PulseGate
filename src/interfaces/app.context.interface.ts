import Database from "better-sqlite3";

export interface AppContext {
    db: Database.Database;
}