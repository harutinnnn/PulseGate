import {Router} from "express";
import JobController from "../../controllers/JobController";


const router = Router();


router.get('/jobs',
    JobController.jobs
)

router.get('/jobs/:id',
    JobController.job
)


export default router;