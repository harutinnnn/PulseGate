import type { Knex } from "knex";
import path from "path";

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "sqlite3",
        connection: {
            filename: path.join(__dirname, "database.sqlite")
        },
        useNullAsDefault: true,
        migrations: {
            extension: "ts",
            directory: "./migrations"
        }
    }
};

export default config;