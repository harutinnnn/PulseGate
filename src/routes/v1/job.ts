import {NextFunction, Request, Response, Router} from "express";
import JobController from "../../controllers/JobController";

import {validate} from "../../middleware/validate";
import { registerUserSchema, RegisterUserInput } from "../../schemas/createUser.schema";
import { z } from 'zod'
import {createJobSchema} from "../../schemas/createJob.schema";

const router = Router();



router.get('/jobs/:id',
    JobController.job
)

router.put('/jobs/:id',
    JobController.job
)

router.post('/jobs',
    // validate(createJobSchema),
    JobController.addJob
)


router.get('/jobs',
    validate(registerUserSchema),
    JobController.jobs
)


export default router;