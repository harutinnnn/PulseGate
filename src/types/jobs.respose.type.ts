export type JobsResponseType = {
    items?: Job[],
    next_cursor: number | undefined
}

export type Job = {
    id: number,
    status: string,
    created_at: string,
}