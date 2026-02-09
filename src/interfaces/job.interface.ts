/**
 * src/domain/job.ts
 */
import {StatusesEnum} from "../enums/statuses.enum";

export type JobStatus =
    StatusesEnum.STATUS_PENDING
    | StatusesEnum.STATUS_SCHEDULED
    | StatusesEnum.STATUS_QUEUED
    | StatusesEnum.STATUS_PROCESSING
    | StatusesEnum.STATUS_SUCCESS
    | StatusesEnum.STATUS_FAILED
    | StatusesEnum.STATUS_DLQ
    | StatusesEnum.STATUS_CANCELED;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Job {
    // Identity
    id: string;
    tenant_id: string;

    // Discriminator
    type: string;

    // State
    status: JobStatus;

    // The actual data to send
    payload: Record<string, unknown>;

    // Destination Configuration
    destination_url: string;
    destination_method: HttpMethod;
    destination_headers?: Record<string, string>;
    destination_timeout_ms: number;

    // Retry Policy
    max_attempts: number;
    current_attempts: number;
    base_delay_ms: number;
    max_delay_ms: number;

    // Rate Limiting (Token Bucket)
    rate_limit_rps?: number;
    rate_limit_burst?: number;

    // Metadata / Advanced Logic
    dedupe_key?: string;
    idempotency_key?: string;
    last_error?: string; // Captures the error from the last failed attempt

    // Timestamps
    execute_at: Date;    // Next execution time
    created_at: Date;
    updated_at: Date;
}