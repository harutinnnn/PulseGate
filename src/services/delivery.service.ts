import {Job} from "../interfaces/job.interface";
import {AttemptType} from "../types/attempt.type";
import {StatusesEnum} from "../enums/statuses.enum";

export class DeliveryService {

    async deliver(job: Job): Promise<AttemptType> {

        //const allowed = someUtility;
        const allowed = true;

        if (!allowed) {
            throw new Error('rate_limited');
        }


        try {
            const url = new URL(job.destination_url)
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('invalid_protocol');
            }
        } catch (error) {
            throw new Error("invalid_url");
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), job.destination_timeout_ms);
        const startTime = new Date();


        try {
            const response = await fetch(job.destination_url, {
                method: job.destination_method,
                headers: job.destination_headers,
                body: JSON.stringify(job.payload),
                signal: controller.signal,
            })

            const responseBody = await response.text();

            return {
                job_id: job.id,
                attempt_number: job.current_attempts + 1,
                started_at: startTime,
                finished_at: new Date(),
                status: response.ok ? StatusesEnum.STATUS_SUCCESS : StatusesEnum.STATUS_FAILED,
                http_status: response.status,
                response_body: responseBody
            }

        } catch (error: any) {

            return {
                job_id: job.id,
                attempt_number: job.current_attempts + 1,
                started_at: startTime,
                finished_at: new Date(),
                status: StatusesEnum.STATUS_FAILED,
                error: error.name === 'AbortError' ? 'timeout' : error.message
            };

        } finally {
            clearTimeout(timeout);
        }

    }

}