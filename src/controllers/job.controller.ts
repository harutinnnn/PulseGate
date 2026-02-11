import {Request, Response} from "express";
import logger from '../config/logger';
import {parseBodyToJobData} from "../utils/job.parser.utlity";
import {AppContext} from "../interfaces/app.context.interface";
import JobRepository from "../repositories/job.repository";
import {JobStatus} from "../interfaces/job.interface";
import {JobListSchema} from "../schemas/job.list.schema";
import {StatusesEnum} from "../enums/statuses.enum";

export default class JobController {
    public jobRepo: JobRepository;

    constructor(private context: AppContext) {
        this.jobRepo = context.jobRepo;
    }

    /**
     * @param req
     * @param res
     */
    addJob = async (
        req: Request,
        res: Response
    ) => {

        const {dedupe_key} = req.body;

        try {

            //Check Idempotency Key
            const idempotencyKey = req.headers['idempotency-key'] as string;

            if (idempotencyKey) {
                const existingJob = this.jobRepo.findByIdempotencyKey(req.body.tenant_id, idempotencyKey)
                if (existingJob) {
                    return res.status(200).json(existingJob)
                }
            }

            //Check Deduplication Key
            if (dedupe_key) {

                //check isf exists in LRUCache
                const existingJobId = this.context.dedupeCache.check(dedupe_key);

                //if exists getting from db and return
                if (existingJobId) {
                    const job = this.context.jobRepo.get(existingJobId);
                    if (job) {
                        return res.status(200).json(job);
                    }
                }

                //check in db by dedup key
                const dbJob = this.context.jobRepo.findByDedupeKey(dedupe_key);

                //if exists return and set in LRUCache
                if (dbJob) {
                    this.context.dedupeCache.set(dedupe_key, dbJob.id);
                    return res.status(200).json(dbJob);
                }
            }

            //Parsing data for insert
            const jobData = parseBodyToJobData(req.body, idempotencyKey)

            // Create job
            const createdJob = this.jobRepo.create(jobData);

            // Update dedupe cache
            if (dedupe_key) {
                this.context.dedupeCache.set(dedupe_key, createdJob.id);
            }

            //Put job in queue if execute_at < Date now
            if (jobData.execute_at < new Date()) {

                //Push in queue(enque)
                const enqueued = this.context.queue.enqueue(createdJob)

                //if enqueued update job status to queued
                if (enqueued) {
                    this.context.jobRepo.updateStatus(createdJob.id, StatusesEnum.STATUS_QUEUED);
                    //change status on new one(queued)
                    createdJob.status = StatusesEnum.STATUS_QUEUED;
                    logger.info(`Job ${createdJob.id} enqueued`, {job_id: createdJob.id});
                } else {
                    logger.warn(`Job ${createdJob.id} queue full, scheduled for later`, {job_id: createdJob.id});
                }

            } else {
                logger.info(`Job ${createdJob.id} scheduled for ${createdJob.execute_at.toISOString()}`, {job_id: createdJob.id});
            }

            return res.status(201).json(createdJob);

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
    jobs = async (
        req: Request,
        res: Response
    ) => {

        try {

            const result = JobListSchema.safeParse(req.query);
            if (!result.success) {
                return res.status(400).json({error: {message: 'Validation failed', details: result.error.issues}});
            }

            const {tenant_id, limit, cursor, status, type} = result.data;

            const {jobs, nextCursor} = this.context.jobRepo.list({
                tenantId: tenant_id,
                limit,
                cursor,
                status: status as JobStatus | undefined,
                type
            });

            return res.status(200).json({
                items: jobs,
                next_cursor: nextCursor
            });

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
    job = async (
        req: Request<{ id: string }>,
        res: Response
    ) => {

        const {id} = req.params;
        const job = this.context.jobRepo.get(id);

        if (!job) {
            return res.status(404).json({error: {message: 'Job not found'}});
        }

        return res.json(job);
    }

    /**
     * @param req
     * @param res
     */
    retry = async (
        req: Request<{ id: string }>,
        res: Response
    ) => {

        const {id} = req.params;

        const job = this.context.jobRepo.get(id);

        if (!job) {
            return res.status(404).json({error: {message: 'Job not found'}});
        }

        if (!['failed', 'dlq'].includes(job.status)) {
            return res.status(409).json({error: {message: `Cannot retry job in ${job.status} state`}});
        }

        try {

            this.context.jobRepo.retry(id, StatusesEnum.STATUS_QUEUED);

            logger.info(`Job ${id} retried manually`, {job_id: id});
            return res.json({id, status: 'queued'});

        } catch (e: any) {

            logger.error(`Error retrying job ${id}`, {error: e.message});
            return res.status(500).json({error: {message: 'Internal Server Error'}});
        }
    }

    /**
     * @param req
     * @param res
     */
    cancel = async (
        req: Request<{ id: string }>,
        res: Response
    ) => {

        const {id} = req.params;
        const job = this.context.jobRepo.get(id);

        if (!job) {
            return res.status(404).json({error: {message: 'Job not found'}});
        }

        if (['processing', 'success', 'dlq', 'canceled'].includes(job.status)) {
            return res.status(409).json({error: {message: `Cannot cancel job in ${job.status} state`}});
        }


        try {

            this.context.jobRepo.updateStatus(id, StatusesEnum.STATUS_CANCELED);
            logger.info(`Job ${id} cancelled`, {job_id: id});

            return res.json({id, status: 'cancelled'});

        } catch (error: any) {

            logger.error(`Error cancelling job ${id}`, {error: error.message});
            return res.status(500).json({error: {message: 'Internal Server Error'}});
        }


    }
}