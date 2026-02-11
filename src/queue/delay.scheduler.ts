import {Heap} from 'heap-js';
import {JobType} from "../types/job.type";
import JobRepository from "../repositories/job.repository";
import {MemoryQueue} from "./memory.queue";
import logger from "../config/logger";
import {StatusesEnum} from "../enums/statuses.enum";

export class DelayScheduler {
    private heap: Heap<JobType>;
    private intervalId: NodeJS.Timeout | null = null;
    private running = false;

    constructor(
        private repo: JobRepository,
        private queue: MemoryQueue
    ) {
        this.heap = new Heap<JobType>((a, b) =>
            new Date(a.execute_at).getTime() - new Date(b.execute_at).getTime()
        );
    }

    start(pollMs: number = 5000): void {

        if (this.running) return;
        this.running = true;
        logger.info(`Starting delay scheduler with poll interval ${pollMs}ms`);

        // Initial poll
        this.tick().catch(err => logger.error('Scheduler tick error', { error: err.message }));

        this.intervalId = setInterval(() => {
            this.tick().catch(err => logger.error('Scheduler tick error', { error: err.message }));
        }, pollMs);
    }

    private async tick(): Promise<void> {
        if (!this.running) return;

        try {
            //1. Fetch jobs from DB "status=scheduled, execute_at <= now"
            const limit = 100;
            const jobs = this.repo.getReadyJobs(limit);

            if (jobs.length > 0) {
                logger.info(`Scheduler found ${jobs.length} ready jobs`);

                for (const job of jobs) {
                    const enqueued = this.queue.enqueue(job);
                    if (enqueued) {
                        // Update status to queued
                        this.repo.updateStatus(job.id, StatusesEnum.STATUS_QUEUED);
                        logger.debug(`Job ${job.id} enqueued`, { job_id: job.id });
                    } else {
                        // Queue full, stop processing batch and try again next tick
                        logger.warn('Queue full, pausing scheduler fetch');
                        break;
                    }
                }
            }
        } catch (error: any) {
            logger.error('Error in scheduler tick', { error: error.message });
        }
    }

    stop(): void {
        this.running = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        logger.info('Scheduler stopped');
    }
}
