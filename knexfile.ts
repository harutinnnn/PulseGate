import type {Knex} from "knex";
import path from "path";

const isProd = process.env.NODE_ENV === 'production';
console.log(isProd);
const config: { [key: string]: Knex.Config } = {
    development: {
        client: "sqlite3",
        connection: {
            filename: path.join(__dirname, "database.sqlite")
        },
        useNullAsDefault: true,
        migrations: {
            extension: "ts",
            directory: !isProd ? './migrations' : './migrations/migrations',
        }
    }
};

export default config;