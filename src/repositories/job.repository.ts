import {JobType} from "../types/job.type";
import {nanoid} from "nanoid";
import {Database} from "better-sqlite3";
import {StatusesEnum} from "../enums/statuses.enum";
import {Job} from "../types/jobs.respose.type";
import {JobAttemptsResponse} from "../types/job.attempts.type";
import {JobStatus} from "../interfaces/job.interface";

export default class JobRepository {

    constructor(private db: Database) {
    }

    /**
     * @param job
     */
    create(job: Omit<JobType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'>) {

        const id = nanoid();
        const now = new Date();
        const newJob: JobType = {
            ...job,
            id,
            created_at: now,
            updated_at: now,
            current_attempts: 0
        }

        const stmt = this.db.prepare(
            `
                INSERT INTO jobs (id, tenant_id, type, status, payload_order_id, payload_status, destination_url,
                                  destination_method,
                                  destination_headers, destination_timeout_ms, dedupe_key, execute_at,
                                  created_at, updated_at, max_attempts, current_attempts, base_delay_ms,
                                  max_delay_ms, rate_limit_rps, rate_limit_burst, idempotency_key)
                VALUES (@id, @tenant_id, @type, @status, @payload_status, @payload_status, @destination_url,
                        @destination_method,
                        @destination_headers, @destination_timeout_ms, @dedupe_key, @execute_at,
                        @created_at, @updated_at, @max_attempts, @current_attempts, @base_delay_ms,
                        @max_delay_ms, @rate_limit_rps, @rate_limit_burst, @idempotency_key)
            `
        );


        stmt.run({
            ...newJob,
            destination_headers: newJob.destination_headers ? JSON.stringify(newJob.destination_headers) : null,
            execute_at: newJob.execute_at.toISOString(),
            created_at: newJob.created_at.toISOString(),
            updated_at: newJob.updated_at.toISOString()
        });
        return newJob;
    }


    /**
     * @param options
     */
    list(options: {
        tenantId: string;
        limit: number;
        cursor?: string;
        status?: StatusesEnum;
        type?: string;
    }): { jobs: Job[], nextCursor?: string } {

        let query = 'SELECT * FROM jobs WHERE tenant_id = ?';
        const params: any[] = [options.tenantId];

        if (options.status) {
            query += ' AND status = ?';
            params.push(options.status);
        }

        if (options.type) {
            query += ' AND type = ?';
            params.push(options.type);
        }

        if (options.cursor) {
            query += ' AND created_at < ?';
            params.push(options.cursor);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(options.limit + 1);

        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params) as any[];

        let nextCursor: string | undefined;
        if (rows.length > options.limit) {
            const nextItem = rows.pop();
            nextCursor = nextItem.created_at;
        }

        return {
            jobs: rows,
            nextCursor
        };
    }


    /**
     * @param id
     */
    get(id: string): Job | undefined {
        const stmt = this.db.prepare('SELECT * FROM jobs WHERE id = ?');
        const row = stmt.get(id) as any;
        if (!row) return undefined;
        return row;
    }

    /**
     * @param tenantId
     * @param key
     */
    findByIdempotencyKey(tenantId: string, key: string): JobType | undefined {
        const stmt = this.db.prepare('SELECT * FROM jobs WHERE tenant_id = ? AND idempotency_key = ?');
        const row = stmt.get(tenantId, key) as any;
        if (!row) return undefined;
        return row;
    }


    /**
     * @param jobId
     */
    getAttempts(jobId: string): JobAttemptsResponse[] {
        const stmt = this.db.prepare('SELECT * FROM attempts WHERE job_id = ? ORDER BY attempt_number ASC');
        const rows = stmt.all(jobId) as any[];
        return rows.map(row => ({
            ...row,
            started_at: new Date(row.started_at),
            finished_at: row.finished_at ? new Date(row.finished_at) : undefined
        }));
    }

    /**
     * @param id
     * @param status
     * @param lastError
     */
    updateStatus(id: string, status: StatusesEnum, lastError?: string): void {
        const stmt = this.db.prepare(`
            UPDATE jobs
            SET status     = ?,
                updated_at = ?,
                last_error = ?
            WHERE id = ?
        `);
        stmt.run(status, new Date().toISOString(), lastError || null, id);
    }

    /**
     * @param id
     * @param status
     * @param lastError
     */
    retry(id: string, status: StatusesEnum, lastError?: string): void {
        const stmt = this.db.prepare(`
            UPDATE jobs
            SET status           = ?,
                updated_at       = ?,
                last_error       = ?,
                current_attempts = 0
            WHERE id = ?
        `);
        stmt.run(status, new Date().toISOString(), lastError || null, id);
    }


    findByDedupeKey(key: string): JobType | undefined {
        const stmt = this.db.prepare('SELECT * FROM jobs WHERE dedupe_key = ? ORDER BY created_at DESC LIMIT 1');
        const row = stmt.get(key) as any;
        if (!row) return undefined;
        return row;
    }
}