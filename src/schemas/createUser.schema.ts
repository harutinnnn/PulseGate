import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email({ error: "Please enter a valid email address" }),

    password: z.string()
        .min(8, "Password is too short")
        .regex(/[A-Z]/, "Include an uppercase letter")
        .regex(/[0-9]/, "Include a number"),
});

// Infer the TS type
export type LoginInput = z.infer<typeof loginSchema>;