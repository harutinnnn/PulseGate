import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod/v4";
import {AnyZodObject} from "zod/v4";

export const validate =
    (schema: AnyZodObject) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

                return next();
            } catch (error) {
                // 1. Check if it is a ZodError
                if (error instanceof ZodError) {

                    // 2. Map the errors
                    // If you still get TS errors here, explicit casting (as ZodError) is a safe fallback
                    const zodError = error as ZodError;

                    const formattedErrors = zodError.errors.map((e) => ({
                        path: e.path.join('.'),
                        message: e.message
                    }));

                    return res.status(400).json({
                        status: "fail",
                        errors: formattedErrors
                    });
                }

                // Handle other unexpected errors
                return res.status(500).json({ status: "error", message: "Internal Error" });
            }
        };