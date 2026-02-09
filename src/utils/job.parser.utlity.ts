import {JobType} from "../types/job.type";
import {JobGetType} from "../types/job.get.type";
import {StatusesEnum} from "../enums/statuses.enum";
import {JobCreateDataType} from "../types/job.create.data.type";


export function JobParserUtility(job: JobType): JobGetType {
    return {
        id: job.id,
        tenant_id: job.tenant_id,
        type: job.type,
        status: job.status,
        created_at: new Date(job.created_at).toISOString(),
        execute_at: job.execute_at,
        attempts: job.current_attempts,
        max_attempts: job.max_attempts,
        last_error: job?.last_error || "",

        destination: {
            url: job.destination_url,
            method: job.destination_method
        }
    };
}


export function parseBodyToJobData(
    data: Omit<JobCreateDataType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'>,
    idempotencyKey: string | undefined
): Omit<JobType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'> {

    return {
        tenant_id: data.tenant_id,
        type: data.type,
        status: StatusesEnum.STATUS_PENDING,
        payload_order_id: data.payload.order_id,
        payload_status: data.payload.status,
        destination_url: data.destination.url,
        destination_method: data.destination.method,
        destination_headers: Object.entries(data.destination.headers || {})
            .map(([key, value]) => `${key}:${value}`)
            .join(';'),
        destination_timeout_ms: data.destination.timeout_ms,
        dedupe_key: data.dedupe_key,
        execute_at: new Date(data.execute_at),
        max_attempts: data.retry.max_attempts,
        base_delay_ms: data.retry?.base_delay_ms,
        max_delay_ms: data.retry?.max_delay_ms,
        rate_limit_rps: data.rate_limit.rps,
        rate_limit_burst: data.rate_limit.burst,
        idempotency_key: idempotencyKey
    };
}