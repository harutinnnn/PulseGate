import {createApp} from './app';
import logger from './config/logger';
import db from './db';

import type {Server} from 'http';
import TaskScheduler from "./queue/taskScheduler";
import {AppContext} from "./interfaces/app.context.interface";
import JobRepository from "./repositories/job.repository";
import {DedupeCache} from "./utils/dedupe.cache.utility";

let server: Server;
let taskScheduler: TaskScheduler;
let isShuttingDown = false;

async function main(): Promise<void> {

    const jobRepo = new JobRepository(db);
    const dedupeCache = new DedupeCache(
        Number(process.env.DEDUPE_CACHE_SIZE || 10000),
        Number(process.env.DEDUPE_WINDOW_SECONDS || 3600)
    );

    const context: AppContext = {
        jobRepo,
        dedupeCache
    };

    taskScheduler = new TaskScheduler(context);
    taskScheduler.start()

    const app = createApp(context);
    // Start server
    const PORT = Number(process.env.PORT) || 3000;
    server = app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Running on http://localhost:${PORT}`);
    });


    // Start workers and scheduler


    //Shootdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down gracefully...`);

    try {

        //Close server
        await closeServer(server);

        //Close task scheduler
        taskScheduler.stop();
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
