import {Request, Response} from "express";
import {validationResult} from "express-validator";
import JobInterface from "../interfaces/JobInterface";
import ErrorResponseInterface from "../interfaces/ErrorResponseInterface";


class JobController {

    /**
     * @param req
     * @param res
     */
    async jobs(
        req: Request,
        res: Response<JobInterface[] | ErrorResponseInterface>
    ): Promise<Response> {


        const jobs: JobInterface[] = [];
        const job: JobInterface = {
            "id": "job_abc",
            "tenant_id": "t_123",
            "type": "webhook.dispatch",
            "status": "queued",
            "created_at": "2026-02-02T11:00:00Z",
            "execute_at": "2026-02-02T12:00:00Z",
            "attempts": 2,
            "max_attempts": 8,
            "last_error": "timeout",
            "destination": {
                "url": "https://example.com/webhook",
                "method": "POST"
            }
        }

        jobs.push(job)
        jobs.push(job)
        jobs.push(job)
        jobs.push(job)


        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(401).json({statusCode: 401, message: 'validation error'})
            }

            return res.status(200).json(jobs)

        } catch (e) {

            if (e instanceof Error) {

                return res.status(401).json({statusCode: 401, message: e.message})
            } else {

                return res.status(401).json({statusCode: 401, message: 'unknown error'})
            }
        }
    }


    /**
     * @param req
     * @param res
     */
    async job(
        req: Request,
        res: Response<JobInterface | ErrorResponseInterface>
    ): Promise<Response> {

        const job: JobInterface = {
            "id": "job_abc",
            "tenant_id": "t_123",
            "type": "webhook.dispatch",
            "status": "queued",
            "created_at": "2026-02-02T11:00:00Z",
            "execute_at": "2026-02-02T12:00:00Z",
            "attempts": 2,
            "max_attempts": 8,
            "last_error": "timeout",
            "destination": {
                "url": "https://example.com/webhook",
                "method": "POST"
            }
        }

        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {


                return res.status(400).json({statusCode: 401, message: 'validation error'})

            }

            return res.status(200).json(job)

        } catch (e) {

            if (e instanceof Error) {


                return res.status(401).json({statusCode: 401, message: e.message})
            } else {


                return res.status(401).json({statusCode: 401, message: 'unknown error'})
            }
        }
    }


}

export default new JobController();