import {AppContext} from "../interfaces/app.context.interface";
import {parseBodyToJobData} from "../utils/job.parser.utlity";
import {Request, Response} from "express";

export const createJobHandler =
    (context: AppContext) =>
        async (req: Request, res: Response) => {

            try {


                const idempotencyKey = req.headers['idempotency-key'] as string;

                if (idempotencyKey) {
                    const existingJob = context.jobRepo.findByIdempotencyKey(req.body.tenant_id, idempotencyKey)
                    if (existingJob) {
                        return res.status(200).json(existingJob)
                    }
                }

                const dedupe_key = req.body.dedupe_key
                //Check Deduplication Key
                if (dedupe_key) {

                    //check isf exists in LRUCache
                    const existingJobId = context.dedupeCache.check(dedupe_key);

                    //if exists getting from db and return
                    if (existingJobId) {
                        const job = context.jobRepo.get(existingJobId);
                        if (job) {
                            return res.status(200).json(job);
                        }
                    }

                    //check in db by dedup key
                    const dbJob = context.jobRepo.findByDedupeKey(dedupe_key);

                    //if exists return and set in LRUCache
                    if (dbJob) {
                        context.dedupeCache.set(dedupe_key, dbJob.id);
                        return res.status(200).json(dbJob);
                    }
                }

                const jobData = parseBodyToJobData(req.body, idempotencyKey)

                const newJob = context.jobRepo.create(jobData);
                return res.status(201).json(newJob);

            } catch (e) {
                return res.status(500).json({error: {message: 'Internal Server Error'}});
            }

        }