import {Router} from "express";
import JobController from "../../controllers/job.controller";
import AttemptController from "../../controllers/attempt.controller";

import {validate, validateParams, validateQueryString} from "../../middleware/validate";
import {createJobSchema} from "../../schemas/create.job.schema";
import {z} from 'zod';
import {JobListSchema} from "../../schemas/job.list.schema";

const router = Router();


router.get('/jobs',
    validateQueryString(JobListSchema),
    JobController.jobs
)

router.get('/jobs/:id',
    validateParams(z.object({
        id: z.coerce.number()
    })),
    JobController.job
)


router.get('/jobs/:id/attempts',
    validateParams(z.object({
        id: z.coerce.number()
    })),
    AttemptController.list
)

router.get('/jobs/:id/retry',
    validateParams(z.object({
        id: z.coerce.number()
    })),
    JobController.retry
)

router.get('/jobs/:id/cancel',
    validateParams(z.object({
        id: z.coerce.number()
    })),
    JobController.cancel
)

// router.put('/jobs/:id',
//     JobController.job
// )

router.post('/jobs',
    validate(createJobSchema),
    JobController.addJob
)

export default router;