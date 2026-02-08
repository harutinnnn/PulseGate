import {JobType} from "../types/job.type";
import {JobGetType} from "../types/job.get.type";


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
        last_error: job.last_error,

        destination: {
            url: job.destination_url,
            method: job.destination_method
        }
    };
}