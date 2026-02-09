import {Router} from "express";
import JobController from "../../controllers/job.controller";
import AttemptController from "../../controllers/attempt.controller";

import {validate, validateParams, validateQueryString} from "../../middleware/validate";
import {createJobSchema} from "../../schemas/create.job.schema";
import {z} from 'zod';
import {JobListSchema} from "../../schemas/job.list.schema";
import {AppContext} from "../../interfaces/app.context.interface";

export const jobRoute = (context: AppContext) => {

    const jobController = new JobController(context);
    const attemptController = new AttemptController(context);

    const router = Router();


    router.post('/jobs',
        validate(createJobSchema),
        jobController.addJob
    )


    router.get('/jobs',
        jobController.jobs
    )

    router.get('/jobs/:id',
        jobController.job
    )


    router.get('/jobs/:id/attempts',
        attemptController.list
    )


    router.get('/jobs/:id/cancel',
        jobController.cancel
    )


    router.get('/jobs/:id/retry',
        jobController.retry
    )



    return router

}