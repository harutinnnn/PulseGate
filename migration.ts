import {migrateDb} from './src/db/migration'
import db from "./src/db/index";

(async () => {
    migrateDb(db)
})()
