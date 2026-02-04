export default interface JobInterface {
    id: string,
    tenant_id: string,
    type: string
    status: string,
    created_at: string,
    execute_at: string,
    attempts: number,
    max_attempts: number
    last_error: string,
    destination: DestinationInterface,
}

export interface DestinationInterface {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}