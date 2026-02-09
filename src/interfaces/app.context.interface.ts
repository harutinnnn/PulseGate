import JobRepository from "../repositories/job.repository";
import {DedupeCache} from "../utils/dedupe.cache.utility";

export interface AppContext {
    jobRepo: JobRepository;
    dedupeCache: DedupeCache;
}