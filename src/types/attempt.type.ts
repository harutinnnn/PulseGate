import {StatusesEnum} from "../enums/statuses.enum";

export type AttemptType = {
    id?: number,
    job_id: string,
    attempt_number: number,
    started_at: Date,
    finished_at: Date,
    status: StatusesEnum.STATUS_SUCCESS | StatusesEnum.STATUS_FAILED,
    http_status?: number,
    error?: string,
    response_body?: string | null,
}