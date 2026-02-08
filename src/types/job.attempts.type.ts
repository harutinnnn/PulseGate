export type JobAttemptsType = {
    id: number,
    job_id?: string,
    attempt_number: number,
    started_at: Date | null,
    finished_at: Date | null,
    status: string,
    http_status?: number | null,
    error: string | null,
    response_body?: string | null,
}