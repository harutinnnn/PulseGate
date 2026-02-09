import JobRepository from "../repositories/job.repository";

export interface AppContext {
    jobRepo: JobRepository;
}