import {Router} from "express";
import JobController from "../controllers/job.controller";
import AttemptController from "../controllers/attempt.controller";

import {validate} from "../middleware/validate";
import {createJobSchema} from "../schemas/create.job.schema";
import {AppContext} from "../interfaces/app.context.interface";
import {createJobHandler} from "./createJobHandler";
import {getJobHandler} from "./tests/get.job.handler";

export const jobRoute = (context: AppContext) => {

    const jobController = new JobController(context);
    const attemptController = new AttemptController(context);

    const router = Router();

    /**
     * @openapi
     * /v1/post:
     *   post:
     *     summary: Dispatch a webhook event
     *     description: Creates and schedules a webhook dispatch request.
     *     tags:
     *       - Jobs
     *     parameters:
     *       - in: header
     *         name: Idempotency-Key
     *         required: false
     *         schema:
     *           type: string
     *         description: Optional idempotency key to prevent duplicate processing
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AddJobRequest'
     *     responses:
     *       200:
     *         description: Webhook dispatch created successfully
     *       400:
     *         description: Invalid request
     */
    router.post('/jobs',
        validate(createJobSchema),
        createJobHandler(context)
        // jobController.addJob
    )


    /**
     * @openapi
     * /v1/jobs:
     *   get:
     *     summary: List webhook jobs
     *     description: Returns paginated list of webhook jobs.
     *     tags:
     *       - Jobs
     *     parameters:
     *       - in: query
     *         name: tenant_id
     *         required: true
     *         schema:
     *           type: string
     *         description: Tenant identifier
     *         example: t_123
     *
     *       - in: query
     *         name: limit
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 20
     *         description: Number of results to return
     *
     *       - in: query
     *         name: cursor
     *         required: false
     *         schema:
     *           type: string
     *         description: Pagination cursor
     *         example: eyJpZCI6IjEyMyJ9
     *
     *       - in: query
     *         name: status
     *         required: false
     *         schema:
     *           type: string
     *           enum: [pending, processing, completed, failed]
     *         description: Filter by job status
     *
     *       - in: query
     *         name: type
     *         required: false
     *         schema:
     *           type: string
     *         description: Filter by job type
     *
     *     responses:
     *       200:
     *         description: Paginated list of jobs
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/JobsListResponse'
     *       400:
     *         description: Invalid query parameters
     */
    router.get('/jobs',
        jobController.jobs
    )

    /**
     * @openapi
     * /v1/jobs/{id}:
     *   get:
     *     summary: Get job details
     *     description: Returns full details of a specific job.
     *     tags:
     *       - Jobs
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Unique job identifier
     *         example: job_abc
     *     responses:
     *       200:
     *         description: Job details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/JobDetails'
     *       404:
     *         description: Job not found
     */
    router.get('/jobs/:id',
        getJobHandler(context)
    )


    /**
     * @openapi
     * /v1/jobs/{id}/attempts:
     *   get:
     *     summary: List job attempts
     *     description: Returns all delivery attempts for a specific job.
     *     tags:
     *       - Jobs
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Job identifier
     *         example: job_abc
     *     responses:
     *       200:
     *         description: List of job attempts
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/JobAttemptsResponse'
     *       404:
     *         description: Job not found
     */
    router.get('/jobs/:id/attempts',
        attemptController.list
    )


    /**
     * @openapi
     * /v1/jobs/{id}/cancel:
     *   get:
     *     summary: Cancel a job
     *     description: Cancels a queued or processing job and returns the updated job status.
     *     tags:
     *       - Jobs
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Job identifier
     *         example: job_abc
     responses:
     *       200:
     *         description: Job cancelled successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/JobCancelResponse'
     *       400:
     *         description: Cannot cancel job (already completed or invalid state)
     *       404:
     *         description: Job not found
     */
    router.get('/jobs/:id/cancel',
        jobController.cancel
    )


    /**
     * @openapi
     * /v1/jobs/{id}/retry:
     *   get:
     *     summary: Retry a job
     *     description: Re-queues a failed job for retry and returns the updated job status.
     *     tags:
     *       - Jobs
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Job identifier
     *         example: job_abc
     *     responses:
     *       200:
     *         description: Job re-queued successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/JobRetryResponse'
     *       400:
     *         description: Cannot retry job (already queued or invalid state)
     *       404:
     *         description: Job not found
     */
    router.get('/jobs/:id/retry',
        jobController.retry
    )


    return router

}