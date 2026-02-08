import {JobCreateDataType} from "../types/job.create.data.type";
import initDB from "../config/database";
import logger from "../config/logger";
import {JobCreateResponseType} from "../types/job.create.response.type";

export default class JobService {


    /**
     * @param data
     */
    async create(data: JobCreateDataType): Promise<JobCreateResponseType> {

        return new Promise<JobCreateResponseType>(async (resolve, reject) => {

            try {

                const db = await initDB();

                console.log('data.destination.headers', data.destination.headers);
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
                        Object.entries(data.destination.headers)
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
}