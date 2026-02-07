import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject<any>) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    status: 'fail',
                    errors: z.formatError(err),
                    // summary: z.prettifyError(err)
                });
            }
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
    };