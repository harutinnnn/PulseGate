import Database from "better-sqlite3";
import {createTestJob, cleanDatabase, closeDatabase, createTestDatabase} from '../../db/testDb'
import {AppContext} from "../../interfaces/app.context.interface";
import JobRepository from "../../repositories/job.repository";
import {DedupeCache} from "../../utils/dedupe.cache.utility";
import {MemoryQueue} from "../../queue/memory.queue";
import {Request, Response} from "express";
import {parseBodyToJobData} from "../../utils/job.parser.utlity";
import {JobCreateDataType} from "../../types/job.create.data.type";
import {getJobHandler} from "./get.job.handler";

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


describe('getJobHandler', () => {

    let db: Database.Database;
    let context: AppContext;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(async () => {

        db = await createTestDatabase();
        context = {
            jobRepo: new JobRepository(db),
            dedupeCache: new DedupeCache(10000, 60000),
            queue: new MemoryQueue(10000)
        }

        jsonMock = jest.fn().mockReturnThis();
        statusMock = jest.fn().mockReturnThis();

        req = {
            params: {}
        };

        res = {
            json: jsonMock,
            status: statusMock
        };
    })

    afterEach(() => {
        cleanDatabase(db)
        closeDatabase(db)
    })

    it('should return job if found', async () => {

        const jobData = parseBodyToJobData({...bodyRaw as Omit<JobCreateDataType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'>}, undefined);

        const job = context.jobRepo.create(jobData)

        req.params = {id: job.id};

        const handler = getJobHandler(context);
        await handler(req as Request, res as Response);

        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: job.id,
                tenant_id: job.tenant_id,
                type: job.type
            })
        );
    })

    it('should return 404 when job not found', async () => {

        req.params = {id: 'non-existing-id'};

        const handler = getJobHandler(context);
        await handler(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
            error: {message: 'Job not found'}
        });
    })

    it('should return complete job data', async () => {

        const jobData = parseBodyToJobData({...bodyRaw as Omit<JobCreateDataType, 'id' | 'created_at' | 'updated_at' | 'current_attempts'>}, undefined);
        jobData.payload_status = 'test-status';
        jobData.payload_order_id = 12;

        const job = context.jobRepo.create(jobData);


        req.params = {id: job.id};

        const handler = getJobHandler(context);
        await handler(req as Request, res as Response);

        const returnedJob = jsonMock.mock.calls[0][0];

        expect({payload_status: returnedJob.payload_status, payload_order_id: returnedJob.payload_order_id})
            .toEqual({payload_status: 'test-status', payload_order_id: 12});
    });


})