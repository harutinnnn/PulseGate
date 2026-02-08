import {JobCreateDataType} from "../types/job.create.data.type";
import initDB from "../config/database";
import logger from "../config/logger";
import {JobCreateResponseType} from "../types/job.create.response.type";
import {JobGetType} from "../types/job.get.type";
import {Job, JobsResponseType} from "../types/jobs.respose.type";
import {countRows} from "../utils/count.rows.utility";

export default class JobService {


    /**
     * @param data
     */
    async create(data: JobCreateDataType): Promise<JobCreateResponseType> {

        return new Promise<JobCreateResponseType>(async (resolve, reject) => {

            try {

                const db = await initDB();

                const status = 'pending';
                const insert = await db?.run(
                    'INSERT INTO ' +
                    'jobs (' +
                    '   tenant_id,' +
                    '   type, ' +
                    '   status,' +
                    '   payload_order_id,' +
                    '   payload_status,' +
                    '   destination_url,' +
                    '   destination_method,' +
                    '   destination_headers,' +
                    '   destination_timeout_ms,' +
                    '   dedupe_key,' +
                    '   execute_at,' +
                    '   created_at,' +
                    '   updated_at,' +
                    '   max_attempts,' +
                    '   base_delay_ms,' +
                    '   max_delay_ms,' +
                    '   current_attempts,' +
                    '   rate_limit_rps,' +
                    '   rate_limit_burst' +
                    ') ' +
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        data.tenant_id,
                        data.type,
                        status,
                        data.payload.order_id,
                        data.payload.status,
                        data.destination.url,
                        data.destination.method,
                        Object.entries(data.destination.headers || {})
                            .map(([key, value]) => `${key}:${value}`)
                            .join(';'),
                        data.destination.timeout_ms,
                        data.dedupe_key,
                        data.execute_at,
                        new Date(),
                        new Date(),
                        data.retry?.max_attempts,
                        data.retry?.base_delay_ms,
                        data.retry?.max_delay_ms,
                        0,
                        data.rate_limit?.rps,
                        data.rate_limit?.burst,
                    ],
                );

                logger.info('Inserted row with ID:' + insert?.lastID)
                resolve({id: insert?.lastID || 0, status: status});

            } catch (err) {
                logger.error(err)
                reject(err);
            }

            return data;
        })
    }

    /**
     * @param id
     */
    async get(id: number): Promise<JobGetType> {


        try {

            const db = await initDB();

            const select = "id,tenant_id,type,status,created_at,execute_at,current_attempts,max_attempts,last_error,destination_url,destination_method"
            const job = await db?.get(`SELECT ${select}
                                       FROM jobs
                                       WHERE id = ?`, [id])


            return job as JobGetType;

        } catch (err) {

            logger.error("Database error in JobService.get:", err);
            throw err;

        }
    }


    /**
     * @param queryParams
     * @return Promise<JobsResponseType>
     */
    async list(queryParams: Record<string, any>): Promise<JobsResponseType> {

        const db = await initDB();

        const {tenant_id, status, limit, cursor} = queryParams;

        const conditions: string[] = []
        const values: any[] = []


        let isWhere = false;

        if (tenant_id) {
            conditions.push('tenant_id = ?')
            values.push(tenant_id)

            isWhere = true;
        }

        if (status) {
            conditions.push('status = ?')
            values.push(status)

            isWhere = true;
        }

        let where: string = ""
        if (isWhere) {
            where = `WHERE ${conditions.join(' AND ')}`
        }

        let limitQuery: string = ""
        if (limit && cursor) {
            limitQuery = `LIMIT  ${limit} OFFSET ${cursor}`;

        } else if (limit) {
            limitQuery = `LIMIT  ${limit}`;
        }

        const sql = `
            SELECT id, status, created_at
            FROM jobs ${where}
            ORDER BY id DESC
                ${limitQuery}`;

        const jobs: Job[] | undefined = await db?.all(sql, values);

        let next_cursor: number | undefined = limit && !cursor ? limit : limit && cursor ? parseInt(limit) + parseInt(cursor) : 0;

        if (jobs?.length && jobs?.length < parseInt(limit)) {
            next_cursor = undefined;
        }

        return {
            items: jobs,
            next_cursor: next_cursor
        }
    }
}