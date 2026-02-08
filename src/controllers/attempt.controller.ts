import {Request, Response} from "express";
import {ErrorResponseInterface} from "../types/error.responce.type";
import logger from '../config/logger';
import JobService from "../services/job.service";
import {JobCreateResponseType} from "../types/job.create.response.type";
import {JobCreateDataType} from "../types/job.create.data.type";
import {JobGetType} from "../types/job.get.type";
import {JobParserUtility} from "../utils/job.parser.utlity";
import {JobType} from "../types/job.type";
import {JobsResponseType} from "../types/jobs.respose.type";
import {JobRetryType} from "../types/job.retry.type";
import {AttemptTypeResponse, JobAttemptsResponse} from "../types/job.attempts.type";


class AttemptController {

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

            const job = await jobService.get(Number(id))

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
    async list(
        req: Request,
        res: Response<JobAttemptsResponse | ErrorResponseInterface>
    ): Promise<Response> {

        try {

            const {id} = req.params;
            const jobService = new JobService()

            const attempts: AttemptTypeResponse[] = await jobService.attempts(Number(id))

            return res.status(200).json({
                items: attempts
            });

        } catch (e: any) {

            return res.status(401).json({
                statusCode: 401,
                message: e.message || 'unknown error'
            });
        }
    }


}

export default new AttemptController();