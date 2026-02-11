import { Request, Response } from 'express';
import { register } from 'prom-client';


/**
 * @openapi
 * /healthz:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Metrics
 *     responses:
 *       200:
 *         description: Returns list of users
 */
export const healthCheck = (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
};


/**
 * @openapi
 * /readyz:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Metrics
 *     responses:
 *       200:
 *         description: Returns list of users
 */
export const readinessCheck = (req: Request, res: Response) => {
    res.status(200).json({ status: 'ready' });
};

/**
 * @openapi
 * /metrics:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Metrics
 *     responses:
 *       200:
 *         description: Returns list of users
 */
export const metricsHandler = async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};
