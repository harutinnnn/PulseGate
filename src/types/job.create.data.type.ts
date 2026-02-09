export type PayloadType = {
    order_id: number;
    status: OrderStatus;
};

export type DestinationType = {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    timeout_ms: number;
};

export type RetryConfigType = {
    max_attempts: number;
    base_delay_ms: number;
    max_delay_ms: number;
};

export type RateLimitConfigType = {
    rps: number; // requests per second
    burst: number;
};

export type JobCreateDataType = {
    tenant_id: string;
    type: string;
    payload: PayloadType;
    destination: DestinationType;
    dedupe_key: string;
    execute_at: string;
    retry: RetryConfigType;
    rate_limit: RateLimitConfigType;
    last_error: string;
    idempotency_key: string
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export type OrderStatus = 'paid' | 'pending' | 'failed' | 'refunded';