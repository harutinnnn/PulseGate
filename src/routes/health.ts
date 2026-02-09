import { Request, Response } from 'express';
import { register } from 'prom-client';

export const healthCheck = (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
};

export const readinessCheck = (req: Request, res: Response) => {
    res.status(200).json({ status: 'ready' });
};

export const metricsHandler = async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};
