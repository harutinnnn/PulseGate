import {createApp} from './app';
import logger from './config/logger';
import db from './db';

import type {Server} from 'http';
import {AppContext} from "./interfaces/app.context.interface";
import JobRepository from "./repositories/job.repository";
import {DedupeCache} from "./utils/dedupe.cache.utility";
import {MemoryQueue} from "./queue/memory.queue";
import {DeliveryService} from "./services/delivery.service";
import {WorkerPool} from "./queue/worker.pool";
import {RateLimitManager} from "./utils/rate.limit.manager";
import {DelayScheduler} from "./queue/delay.scheduler";

let server: Server;
let isShuttingDown = false;
let workers: WorkerPool;
let scheduler: DelayScheduler;

async function main(): Promise<void> {

    //Job repository
    const jobRepo = new JobRepository(db);

    //LRUCache dedup cache
    const dedupeCache = new DedupeCache(
        Number(process.env.DEDUPE_CACHE_SIZE || 10000),
        Number(process.env.DEDUPE_WINDOW_SECONDS || 3600)
    );


    const queue = new MemoryQueue(Number(process.env.QUEUE_CAPACITY) || 10000);
    const rateLimit = new RateLimitManager();
    const delivery = new DeliveryService(rateLimit);
    workers = new WorkerPool(
        queue,
        delivery,
        jobRepo,
        Number(process.env.WORKER_CONCURRENCY || 20)
    );

    scheduler = new DelayScheduler(jobRepo, queue);

    const context: AppContext = {
        jobRepo,
        dedupeCache,
        queue
    };


    const app = createApp(context);
    // Start server
    const PORT = Number(process.env.PORT) || 3000;
    server = app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Running on http://localhost:${PORT}`);
    });

    // seedJob()


    // Start workers and scheduler
    workers.start()
    scheduler.start(Number(process.env.WORKER_CONCURRENCY || 5000));

    //Shootdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down gracefully...`);

    try {

        logger.info('Start shutdown!');
        //Close server
        await closeServer(server);
        //Stop scheduler
        scheduler.stop();

        //Stop workers
        await workers.shutdown(Number(process.env.SHUTDOWN_TIMEOUT_MS || 30000));

        //Close db
        await closeDb();


        logger.info('Shutdown completed');
        process.exit(0);

    } catch (err) {

        logger.error('Shutdown failed', {error: err});
        process.exit(1);
    }
}

function closeServer(server: Server): Promise<void> {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) return reject(err);
            logger.info('Server closed');
            resolve();
        });
    });
}

async function closeDb(): Promise<void> {
    if (!db) return;

    if (typeof db.close === 'function') {
        await db.close();
        logger.info('Database connection closed');
    }
}

main().catch((err) => {
    logger.error('Fatal error', {error: err});
    process.exit(1);
});
