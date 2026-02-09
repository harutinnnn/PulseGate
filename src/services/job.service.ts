import {JobCreateDataType} from "../types/job.create.data.type";
import logger from "../config/logger";
import {JobCreateResponseType} from "../types/job.create.response.type";
import {JobGetType} from "../types/job.get.type";
import {Job, JobsResponseType} from "../types/jobs.respose.type";
import {StatusesEnum} from "../enums/statuses.enum";
import {JobRetryType} from "../types/job.retry.type";
import JobModel from "../controllers/models/job.model";
import {JobType} from "../types/job.type";
import AttemptModel from "../controllers/models/attempt.model";
import {Attempt} from "../types/job.attempts.type";
import {nanoid} from "nanoid";

export default class JobService {


    /**
     * @param data
     */
    async create(data: JobCreateDataType): Promise<JobCreateResponseType> {

        return new Promise<JobCreateResponseType>(async (resolve, reject) => {

            try {

                const id = nanoid();


                const jonData: Record<string, any> = {
                    id: id, tenant_id:
                    data.tenant_id,
                    type:
                    data.type,
                    status:
                    StatusesEnum.STATUS_PENDING,
                    payload_order_id:
                    data.payload.order_id,
                    payload_status:
                    data.payload.status,
                    destination_url:
                    data.destination.url,
                    destination_method:
                    data.destination.method,
                    destination_headers:
                        Object.entries(data.destination.headers || {})
                            .map(([key, value]) => `${key}:${value}`)
                            .join(';'),
                    destination_timeout_ms:
                    data.destination.timeout_ms,
                    dedupe_key:
                    data.dedupe_key,
                    execute_at:
                    data.execute_at,
                    created_at:
                        new Date(),
                    updated_at:
                        new Date(),
                    max_attempts:
                    data.retry?.max_attempts,
                    base_delay_ms:
                    data.retry?.base_delay_ms,
                    max_delay_ms:
                    data.retry?.max_delay_ms,
                    current_attempts:
                        0,
                    rate_limit_rps:
                    data.rate_limit?.rps,
                    rate_limit_burst:
                    data.rate_limit?.burst,
                }

                const lid = JobModel.create(jonData)

                logger.info(`Job ${lid} added`)
                resolve({id: lid, status: jonData.status});

            } catch (err) {
                logger.error(err)
                reject(err);
            }
        })
    }

    /**
     * @param id
     */
    async get(id: string): Promise<JobGetType | any> {
        return JobModel.getJobById(id, ['*'])
    }

    /**
     * @param id
     */
    async retry(id: string): Promise<JobRetryType> {

        try {

            const job: JobType | undefined = await JobModel.getJobById(id, ['id', 'status'])

            if (job) {

                if (job.status !== StatusesEnum.STATUS_FAILED && job.status !== StatusesEnum.STATUS_DLQ) {
                    throw new Error(`The job status is ${job.status} you can retry when status is ${StatusesEnum.STATUS_FAILED} or ${StatusesEnum.STATUS_DLQ} `);
                }

                await JobModel.update(['status'], ['id'], {status: StatusesEnum.STATUS_PENDING, id: id})

                logger.info(`Job ${job.id} retried`)
                return {
                    id: job.id,
                    status: StatusesEnum.STATUS_PENDING,
                };


            } else {
                throw new Error(`Job with id ${id} not found`);
            }

        } catch (err) {
            logger.error("Database error in JobService.get:", err);
            throw err;

        }

    }

    /**
     * @param id
     */
    async cancel(id: string): Promise<JobRetryType> {

        try {

            const job: JobType | undefined = await JobModel.getJobById(id, ['id', 'status'])

            if (job) {
                if (
                    job.status !== StatusesEnum.STATUS_PENDING &&
                    job.status !== StatusesEnum.STATUS_QUEUED &&
                    job.status !== StatusesEnum.STATUS_SCHEDULED
                ) {
                    throw new Error(`The job status is ${job.status} you can cancel when status is ${StatusesEnum.STATUS_PROCESSING} | ${StatusesEnum.STATUS_SCHEDULED} | ${StatusesEnum.STATUS_QUEUED} `);
                }

                await JobModel.update(['status'], ['id'], {status: StatusesEnum.STATUS_CANCELED, id: id})

                logger.info(`Job ${job.id} canceled`)

                return {
                    id: job.id,
                    status: StatusesEnum.STATUS_CANCELED,
                };


            } else {
                throw new Error(`Job with id ${id} not found`);
            }

        } catch (err) {
            logger.error("Database error in JobService.get:", err);
            throw err;

        }

    }

    /**
     * @param queryParams
     * @return Promise<JobsResponseType>
     */
    async list(queryParams: Record<string, any>): Promise<JobsResponseType> {

        const {limit, cursor} = queryParams;

        const jobs: Job[] = JobModel.getJobsList(queryParams, ['id', 'status', 'created_at'])

        let next_cursor: number | undefined = limit && !cursor ? limit : limit && cursor ? parseInt(limit) + parseInt(cursor) : 0;

        if (jobs?.length > 1) {
            if (jobs?.length && jobs?.length < parseInt(limit)) {
                next_cursor = undefined;
            }
        } else if (jobs?.length <= 0) {
            next_cursor = undefined;
        }

        return {
            items: jobs,
            next_cursor: next_cursor
        }
    }


    /**
     * @param id
     */
    async attempts(id: string): Promise<Attempt[]> {

        try {

            return AttemptModel.getJobAttempts(id)

        } catch (err) {

            logger.error("Database error in JobService.get:", err);
            throw err;
        }
    }
}