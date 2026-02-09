export type     JobGetType = {
    id: string,
    tenant_id: string,
    type: string,
    status: string,
    created_at: string | Date,
    execute_at: string | Date,
    attempts: number,
    max_attempts: number,
    last_error: string,
    destination: DestinationType,
}

type DestinationType = {
    url: string,
    method: string,
}