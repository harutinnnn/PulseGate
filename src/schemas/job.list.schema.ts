import {z} from "zod";

export const JobListSchema = z.object({

    tenant_id: z.string().min(1),
    limit: z.coerce.number().min(1).max(100).default(1),
    cursor: z.string().optional(),
    status: z.enum(["pending", "scheduled", "queued", "processing", "success", "dlq"]).optional(),
    type: z.string().optional()
});