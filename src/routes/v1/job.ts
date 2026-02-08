import {Router} from "express";
import JobController from "../../controllers/job.controller";

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

router.put('/jobs/:id',
    JobController.job
)

router.post('/jobs',
    validate(createJobSchema),
    JobController.addJob
)

export default router;