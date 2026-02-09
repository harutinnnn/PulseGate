export type JobAttemptsResponse = {
    items: Attempt[],
}


export type Attempt = {
    id?: number;
    job_id: string;
    attempt_number: number;
    started_at: Date;
    finished_at?: Date;
    status: 'success' | 'failed';
    http_status?: number;
    error?: string;
    response_body?: string;
}