import db from "../../db";
import {AttemptType} from "../../types/attempt.type";
import {AttemptTypeResponse} from "../../types/job.attempts.type";


export default class AttemptModel {

    static tableName: string = "job_attempts";

    /**
     * @param id
     */
    static getAttemptById(id: number, select: string[] = ['*']): AttemptType | undefined {

        const stmt = db.prepare(`
            SELECT ${select.join(', ')}
            FROM ${this.tableName}
            WHERE id = ?`);
        return stmt.get(id) as AttemptType | undefined;

    }

    static getJobAttempts(jobId: number): AttemptTypeResponse[] {

        const stmt = db.prepare(`
            SELECT *
            FROM ${this.tableName}
            WHERE job_id = :job_id
        `);

        return stmt.all({
            job_id: Number(jobId).toString()
        }) as AttemptTypeResponse[];


    }

    static update(sets: string[], where: string[], values: Record<any, any>) {


        const setClause = sets.map(field => `${field} = :${field}`).join(', ');
        const whereClause = where.map(field => `${field} = :${field}`).join(', ');


        const stmt = db.prepare(`UPDATE ${this.tableName}
                                 SET ${setClause}
                                 WHERE ${whereClause}`);
        const result = stmt.run(values)
        return result;
    }


    static prepareForSqlite(data: Record<string, any>) {
        const cleanData: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            if (value instanceof Date) {
                // Convert Dates to ISO strings (e.g., "2026-02-08T..." )
                cleanData[key] = value.toISOString();
            } else if (value === undefined) {
                // Convert undefined to null (SQLite doesn't know undefined)
                cleanData[key] = null;
            } else if (typeof value === 'object' && value !== null && !Buffer.isBuffer(value)) {
                // If you accidentally passed a nested object, stringify it
                cleanData[key] = JSON.stringify(value);
            } else {
                cleanData[key] = value;
            }
        }

        return cleanData;
    };

    static create(values: Record<string, any>) {


        values = this.prepareForSqlite(values);

        const columns = Object.keys(values);
        const placeholders = columns.map(col => `:${col}`).join(', ');
        const columnNames = columns.join(', ');

        const sql = `INSERT INTO ${this.tableName} (${columnNames})
                     VALUES (${placeholders})`;

        const stmt = db.prepare(sql);

        let lid = stmt.run(values)

        return <number>lid?.lastInsertRowid;

    }


}