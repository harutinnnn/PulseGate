import {MemoryQueue} from "./memory.queue";
import {DeliveryService} from "../services/delivery.service";
import JobRepository from "../repositories/job.repository";
import logger from "../config/logger";
import {JobType} from "../types/job.type";
import {AttemptType} from "../types/attempt.type";
import {StatusesEnum} from "../enums/statuses.enum";

export class WorkerPool {
    private workers: Promise<void>[] = [];
    private running = false;

    constructor(
        private queue: MemoryQueue,
        private delivery: DeliveryService,
        private repo: JobRepository,
        private concurrency: number
    ) {
    }

    start(): void {
        this.running = true;
        logger.info(`Starting worker pool with ${this.concurrency} workers`);

        for (let i = 0; i < this.concurrency; i++) {
            const worker = this.runWorker(i);
            this.workers.push(worker);
        }
    }

    private async runWorker(id: number): Promise<void> {
        while (this.running) {
            const job = this.queue.dequeue();
            if (job) {
                try {
                    await this.processJob(job);
                } catch (error: any) {
                    console.error(error);
                    logger.error(`Worker ${id} error processing job ${job.id}`, {error: error.message});
                }
            } else {
                // Wait for new job or timeout
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    private async processJob(job: JobType): Promise<void> {
        logger.info(`Processing job ${job.id}`, {job_id: job.id, attempt: job.current_attempts + 1});

        // Update status to processing
        this.repo.updateStatus(job.id, StatusesEnum.STATUS_PROCESSING);

        // Attempt delivery
        const attempt: AttemptType = await this.delivery.deliver(job);

        // Record attempt
        this.repo.createAttempt(attempt);

        if (attempt.status === StatusesEnum.STATUS_SUCCESS) {
            this.repo.updateStatus(job.id, StatusesEnum.STATUS_SUCCESS);
            logger.info(`Job ${job.id} succeeded`);
        } else {
            await this.handleFailure(job, attempt.error || `HTTP ${attempt.http_status}`);
        }
    }

    private async handleFailure(job: JobType, error: string): Promise<void> {
        const nextAttempt = job.current_attempts + 1;

        if (nextAttempt >= job.max_attempts) {
            // Set status dlq
            this.repo.updateStatus(job.id, StatusesEnum.STATUS_DLQ, error);
            logger.warn(`Job ${job.id} moved to DLQ`, {job_id: job.id, error});
        } else {
            // Retry -> Scheduled
            const baseDelay = job.base_delay_ms || 500;
            const maxDelay = job.max_delay_ms || 30000;

            const delay = Math.min(
                baseDelay * Math.pow(2, nextAttempt - 1),
                maxDelay
            );

            // Jitter: +/- 10%
            const jitter = delay * 0.1 * (Math.random() * 2 - 1);
            const finalDelay = Math.max(0, delay + jitter);

            const nextExecuteAt = new Date(Date.now() + finalDelay);

            this.repo.incrementAttempts(job.id, nextExecuteAt);
            logger.info(`Job ${job.id} scheduled for retry`, {job_id: job.id, attempt: nextAttempt, delay: finalDelay});
        }
    }

    async shutdown(timeoutMs: number = 30000): Promise<void> {
        logger.info('Shutting down worker pool...');
        this.running = false;

        // Wait for workers to finish
        await Promise.race([
            Promise.all(this.workers),
            new Promise(resolve => setTimeout(resolve, timeoutMs))
        ]);

        logger.info('Worker pool shutdown complete');
    }
}
