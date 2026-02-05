import {Router} from "express";
import JobController from "../../controllers/JobController";

import { z } from 'zod'
import {validate} from "../../middleware/validate";

const router = Router();


// const createUserSchema = z.object({
//     email: z.email(),
//     password: z.string().min(8),
// })

router.get('/jobs',
    // validate(createUserSchema),
    JobController.jobs
)

router.get('/jobs/:id',
    JobController.job
)


export default router;