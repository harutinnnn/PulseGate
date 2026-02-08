import {z} from "zod";

export const JobListSchema = z.object({

    tenant_id: z.string().min(1).optional(),
    status: z.enum(["pending", "scheduled", "queued", "processing", "success", "dlq"]).optional(),
    limit: z.coerce.number().optional(),
    cursor: z.coerce.number().optional(),

});