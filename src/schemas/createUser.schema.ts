import {z} from 'zod/v4'


// Zod v4 Validation Schema
export const registerUserSchema = z.object({
    body: z.object({
        username: z
            .string({ error: "Username is required" }) // v4 simplified error message param
            .min(3, "Username must be at least 3 characters"),

        email: z
            .string()
            .email("Invalid email address"),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),

        passwordConfirmation: z.string(),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: "Passwords do not match",
        path: ["passwordConfirmation"], // Attach error to specific field
    }),
});

// Infer the type for use in controllers
export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];