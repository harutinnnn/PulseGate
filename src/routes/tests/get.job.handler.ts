import {AppContext} from "../../interfaces/app.context.interface";
import {Request, Response} from "express";

export const getJobHandler = (context: AppContext) => async (req: Request, res: Response) => {
    const { id } = req.params;
    const job = context.jobRepo.get(id as string);

    if (!job) {
        return res.status(404).json({ error: { message: 'Job not found' } });
    }

    return res.json(job);
};