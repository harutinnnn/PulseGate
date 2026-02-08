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


class JobController {

    /**
     * @param req
     * @param res
     */
    async jobs(
        req: Request,
        res: Response<JobsResponseType | ErrorResponseInterface>
    ): Promise<Response> {

        try {
            const jobService = new JobService()

            const list: JobsResponseType = await jobService.list(req.query)

            return res.status(200).json(list);

        } catch (e: any) {

            logger.error(e);

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
    async job(
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
    async attempts(
        req: Request,
        res: Response<JobGetType | ErrorResponseInterface>
    ): Promise<Response> {

        try {

            const {id} = req.params;
            const jobService = new JobService()

            const job = await jobService.attempts(Number(id))

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
    async retry(
        req: Request,
        res: Response<JobRetryType | ErrorResponseInterface>
    ): Promise<Response> {

        try {

            const {id} = req.params;

            const jobService = new JobService()

            const job = await jobService.retry(Number(id))

            return res.status(200).json(job);

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
    async cancel(
        req: Request,
        res: Response<JobRetryType | ErrorResponseInterface>
    ): Promise<Response> {

        try {

            const {id} = req.params;

            const jobService = new JobService()

            const job = await jobService.cancel(Number(id))

            return res.status(200).json(job);

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
    async addJob(
        req: Request,
        res: Response<JobCreateResponseType | ErrorResponseInterface>
    ): Promise<any> {

        try {

            const jobService = new JobService()

            jobService.create(req.body as JobCreateDataType).then(data => {
                //TODO add in pool heap

                return res.status(200).json({
                    id: data?.id,
                    status: data.status
                })

            }).catch(err => {

                return res.status(401).json({statusCode: 401, message: err.message})
            })

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
    async addJobOld(
        req: Request,
        res: Response<JobCreateResponseType | ErrorResponseInterface>
    ): Promise<any> {

        try {

            const jobService = new JobService()

            jobService.create(req.body as JobCreateDataType).then(data => {
                //TODO add in pool heap

                return res.status(200).json({
                    id: data?.id,
                    status: data.status
                })

            }).catch(err => {

                return res.status(401).json({statusCode: 401, message: err.message})
            })

        } catch (e: any) {
            return res.status(401).json({
                statusCode: 401,
                message: e.message || 'unknown error'
            });
        }
    }
}

export default new JobController();