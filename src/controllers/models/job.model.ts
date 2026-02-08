import db from "../../db";
import {JobType} from "../../types/job.type";
import {Job} from "../../types/jobs.respose.type";
import logger from "../../config/logger";


export default class JobModel {

    static tableName: string = "jobs";

    /**
     * @param id
     */
    static getJobById(id: number, select: string[] = ['*']): JobType | undefined {

        const stmt = db.prepare(`
            SELECT ${select.join(', ')}
            FROM ${this.tableName}
            WHERE id = ?`);
        return stmt.get(id) as JobType | undefined;

    }

    static getJobsList(params: Record<string, any>, select: string[]): Job[] {

        let conditions: any[] = [];
        const values: string[] = []

        if (params.tenant_id) {
            conditions.push('tenant_id = ?');
            values.push(params.tenant_id);
        }

        if (params.status) {
            conditions.push('status = ?');
            values.push(params.status);
        }


        let where: string = ""
        if (conditions.length > 0) {
            where = `WHERE ${conditions.join(' AND ')}`
        }

        let limitQuery: string = ""
        if (params.limit && params.cursor) {
            limitQuery = `LIMIT  ${params.limit} OFFSET ${params.cursor}`;

        } else if (params.limit) {
            limitQuery = `LIMIT  ${params.limit}`;
        }


        const stmt = db.prepare(`
            SELECT ${select.join(', ')}
            FROM ${this.tableName} ${where}
            ORDER BY id DESC
                ${limitQuery}
        `);

        return stmt.all(...values) as Job[];

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