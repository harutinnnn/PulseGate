import {NextFunction, Request, Response, Router} from "express";
import JobController from "../../controllers/JobController";

import {validate} from "../../middleware/validate";
import {createJobSchema} from "../../schemas/create.job.schema";

const router = Router();



router.get('/jobs/:id',
    JobController.job
)

router.put('/jobs/:id',
    JobController.job
)

router.post('/jobs',
    validate(createJobSchema),
    JobController.addJob
)


router.get('/jobs',
    JobController.jobs
)


export default router;