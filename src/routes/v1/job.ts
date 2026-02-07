import {Router} from "express";
import JobController from "../../controllers/JobController";

import {validate} from "../../middleware/validate";
import createUserSchema from "../../schemas/createUserSchema";
import createJobCalidationSchema from "../../schemas/createJobCalidationSchema";

const router = Router();

router.get('/jobs',
    validate(createUserSchema),
    JobController.jobs
)

router.get('/jobs/:id',
    JobController.job
)

router.put('/jobs/:id',
    JobController.job
)
router.post('/jobs',
    validate(createJobCalidationSchema),
    JobController.addJob
)


export default router;