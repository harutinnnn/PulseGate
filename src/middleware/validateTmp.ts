import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

export const validate =
    <T extends z.ZodSchema>(schema: T) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params,
            })

            if (!result.success) {
                return res.status(400).json({
                    errors: result.error.issues.map(issue => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                        code: issue.code,
                    })),
                })
            }

            req.validated = result.data as z.infer<T>
            next()
        }

