import {Request, Response} from "express";
import {ErrorResponseInterface} from "../types/error.responce.type";
import JobService from "../services/job.service";
import {JobGetType} from "../types/job.get.type";
import {JobParserUtility} from "../utils/job.parser.utlity";
import {JobType} from "../types/job.type";

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
    async get(
        req: Request,
        res: Response<JobGetType | ErrorResponseInterface>
    ): Promise<Response> {

        try {

            const {id} = req.params;
            const jobService = new JobService()

            const job = await jobService.get(id.toString())

            if (!job) {
                return res.status(401).json({
                    statusCode: 401,
                    message: `Job #${id} not found`
                });
            }
            return res.status(200).json(JobParserUtility(job as unknown as JobType));

        } catch (e: any) {

            return res.status(401).json({
                statusCode: 401,
                message: e.message || 'unknown error'
            });
        }
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