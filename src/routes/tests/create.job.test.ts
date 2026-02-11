import Database from "better-sqlite3";
import {createTestJob, cleanDatabase, closeDatabase, createTestDatabase} from '../../db/testDb'
import {AppContext} from "../../interfaces/app.context.interface";
import JobRepository from "../../repositories/job.repository";
import {DedupeCache} from "../../utils/dedupe.cache.utility";
import {MemoryQueue} from "../../queue/memory.queue";
import {createJobHandler} from "./createJobHandler";
import {Request, Response} from "express";
import {parseBodyToJobData} from "../../utils/job.parser.utlity";
import {JobCreateDataType} from "../../types/job.create.data.type";


const bodyRaw: Omit<JobCreateDataType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'> = {
    tenant_id: "tenant-1",
    type: "webhook.test",
    payload: {
        order_id: 42,
        status: "paid"
    },
    destination: {
        url: "http://localhost:8080/v1/jobs?tenant_id=t_123&limit=5",
        method: "POST",
        headers: {
            "X-Signature": "1" // <-- make it string
        },
        timeout_ms: 5000
    },
    dedupe_key: "dedupe-1",
    execute_at: "2026-02-02T12:00:00Z",
    retry: {
        max_attempts: 3,
        base_delay_ms: 1000,
        max_delay_ms: 60000
    },
    rate_limit: {
        rps: 5,
        burst: 10
    },
    last_error: "", // required
    idempotency_key: "" // required
};


describe('createJobHandler', () => {

    let db: Database.Database;
    let context: AppContext;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;


    beforeEach(async () => {

        db = await createTestDatabase()
        context = {
            jobRepo: new JobRepository(db),
            dedupeCache: new DedupeCache(1000, 60000),
            queue: new MemoryQueue(100)
        };

        jsonMock = jest.fn().mockReturnThis();
        statusMock = jest.fn().mockReturnThis();

        jest.mock('nanoid', () => {
            return {nanoid: () => 'test-id'};
        });

        req = {
            body: {},
            headers: {}
        };


        res = {
            json: jsonMock,
            status: statusMock
        };
    })

    afterEach(async () => {
        cleanDatabase(db);
        closeDatabase(db);
    })

    describe('Valid Job Creation', () => {

        it('should create a job', async () => {

            req.body = bodyRaw

            const handler = createJobHandler(context);
            await handler(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalled();


            const createdJob = jsonMock.mock.calls[0][0];
            expect(createdJob.id).toBeDefined();
            expect(createdJob.tenant_id).toBe('tenant-1');
            expect(createdJob.type).toBe('webhook.test');
            expect(createdJob.status).toBe('scheduled');

        });


        it('should job duplicate idempotency', async () => {

            req.body = bodyRaw
            req.headers = { 'idempotency-key': 'idem-123' };

            const handler = createJobHandler(context);

            await handler(req as Request, res as Response);
            const firstJob = jsonMock.mock.calls[0][0];

            jsonMock.mockClear();
            statusMock.mockClear();

            await handler(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            const secondJob = jsonMock.mock.calls[0][0];
            expect(secondJob.id).toBe(firstJob.id);

        })


        it('should job for dedup_key cache hit', async () => {

            req.body = bodyRaw

            const handler = createJobHandler(context);
            await handler(req as Request, res as Response);

            const firstJob = jsonMock.mock.calls[0][0];

            jsonMock.mockClear();
            statusMock.mockClear();

            await handler(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            const secondJob = jsonMock.mock.calls[0][0];
            expect(secondJob.id).toBe(firstJob.id);

        })

        it('should job for dedup_key cash hit', async () => {

            const jobData = parseBodyToJobData({...bodyRaw as Omit<JobCreateDataType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'>}, undefined);
            const existingJob = context.jobRepo.create(jobData);

            req.body = bodyRaw

            const handler = createJobHandler(context);
            await handler(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            const returnedJob = jsonMock.mock.calls[0][0];
            expect(returnedJob.id).toBe(existingJob.id);

        })
    });


})