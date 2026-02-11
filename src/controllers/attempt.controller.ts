import {Request, Response} from "express";
import JobRepository from "../repositories/job.repository";
import {AppContext} from "../interfaces/app.context.interface";

class AttemptController {

    public jobRepo: JobRepository;

    constructor(private context: AppContext) {
        this.jobRepo = context.jobRepo;
    }

    /**
     * @param req
     * @param res
     */
    list = async (
        req: Request<{ id: string }>,
        res: Response
    ) => {

        const {id} = req.params;

        const job = this.context.jobRepo.get(id);

        if (!job) {
            return res.status(404).json({error: {message: 'Job not found'}});
        }

        const attempts = this.context.jobRepo.getAttempts(id);

        return res.json(attempts);
    }
}

export default AttemptController;