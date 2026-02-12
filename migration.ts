import {migrateDb} from './src/db/migration'
import db from "./src/db/index";
import Database from "better-sqlite3";

(async () => {
    migrateDb(db)
})()
