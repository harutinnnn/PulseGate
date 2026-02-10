import {Job} from "../types/jobs.respose.type";
import {AppContext} from "../interfaces/app.context.interface";
import JobRepository from "../repositories/job.repository";

export default class JobService {
    public jobRepo: JobRepository;

    constructor(private context: AppContext) {
        this.jobRepo = context.jobRepo;
    }

    createJob = async (job: Job) => {




    }


}