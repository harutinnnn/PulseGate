import JobRepository from "../repositories/job.repository";
import {DedupeCache} from "../utils/dedupe.cache.utility";
import {MemoryQueue} from "../queue/memory.queue";

export interface AppContext {
    jobRepo: JobRepository;
    dedupeCache: DedupeCache;
    queue:MemoryQueue
}