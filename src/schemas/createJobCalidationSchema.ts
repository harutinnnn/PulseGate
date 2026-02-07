import {z} from 'zod'

export default z.object({
    tenant_id: z.string().trim(),
    type: z.string().trim(),
    payload: {
        order_id: z.number(),
        status: z.string().trim(),
    },
    destination: {
        url: z.string().trim(),
        method: z.string().trim(),
        headers: {
            "X-Signature": z.string(),
        },
        timeout_ms: z.number(),
    },
    dedupe_key: z.string().trim(),
    execute_at: z.date(),
    retry: {
        max_attempts: z.number(),
        base_delay_ms: z.number(),
        max_delay_ms: z.number(),
    },
    rate_limit: {
        rps: z.number(),
        burst: z.number()
    },

})