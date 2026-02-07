import { z } from "zod";

/**
 * Headers (real-world safe)
 */
const headersSchema = z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()])
);

/**
 * Destination config
 */
const destinationSchema = z.object({
    url: z.url(),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    headers: headersSchema.optional(),
    timeout_ms: z.number().int().positive(),
});

/**
 * Retry policy
 */
const retrySchema = z.object({
    max_attempts: z.number().int().min(0),
    base_delay_ms: z.number().int().positive(),
    max_delay_ms: z.number().int().positive(),
});

/**
 * Rate limit
 */
const rateLimitSchema = z.object({
    rps: z.number().int().positive(),
    burst: z.number().int().positive(),
});

/**
 * Main event schema
 */
export const createJobSchema = z.object({
    tenant_id: z.string().min(1),

    type: z.literal("webhook.dispatch"),

    payload: z.record(z.string(), z.unknown()),

    destination: destinationSchema,

    dedupe_key: z.string().min(1).optional(),

    // ISO string → Date (v4-correct, not deprecated)
    execute_at: z.coerce.date().optional(),

    retry: retrySchema.optional(),

    rate_limit: rateLimitSchema.optional(),
});