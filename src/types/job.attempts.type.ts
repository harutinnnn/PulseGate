export type JobAttemptsResponse = {
    items: AttemptTypeResponse[],
}


export type AttemptTypeResponse = {
    n: number,
    started_at: Date | null,
    finished_at: Date | null,
    http_status?: number | null,
    error: string | null,
}