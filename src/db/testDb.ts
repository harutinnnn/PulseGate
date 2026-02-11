import Database from 'better-sqlite3';
import path from "path";
import {JobType} from "../types/job.type";
import {migrateTmpDb} from "./migration.tmp";

export async function createTestDatabase(): Promise<Database.Database> {
    const db: Database.Database = new Database(':memory:');

    migrateTmpDb(db);

    return db;
}

export function cleanDatabase(db: Database.Database): void {
    db.prepare('DELETE FROM attempts').run();
    db.prepare('DELETE FROM jobs').run();
}

export function closeDatabase(db: Database.Database): void {
    db.close();
}

export function createTestJob(overrides: Partial<Omit<JobType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'>> = {}): Omit<JobType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'> {
    const now = new Date();

    return {
        tenant_id: 'test-tenant',
        type: 'webhook.test',
        status: 'scheduled',
        payload_status: '',
        destination_headers: '',
        last_error: "",
        dedupe_key: "",
        idempotency_key: "",
        payload_order_id: 1,
        rate_limit_burst: 1,
        rate_limit_rps: 1,
        destination_url: 'http://localhost:3000/webhook',
        destination_method: 'POST',
        destination_timeout_ms: 5000,
        execute_at: now,
        max_attempts: 8,
        base_delay_ms: 500,
        max_delay_ms: 30000,
        ...overrides
    };
}