import {AttemptType} from "../types/attempt.type";
import {StatusesEnum} from "../enums/statuses.enum";
import {JobType} from "../types/job.type";
import {RateLimitManager} from "../utils/rate.limit.manager";

export class DeliveryService {

    constructor(private rateLimiter: RateLimitManager) {
    }

    async deliver(job: JobType): Promise<AttemptType> {

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

            const headers: Record<string, any> = Object.fromEntries(
                job.destination_headers
                    .split(';')
                    .map(part => {
                        const [key, ...rest] = part.split(':');
                        return [key.trim(), rest.join(':').trim()];
                    })
            );

            const response = await fetch(job.destination_url, {
                method: job.destination_method,
                headers: headers,
                body: JSON.stringify({payload_order_id: job.payload_order_id, payload_status: job.payload_status}),
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
                response_body: responseBody,
                error: ""
            }

        } catch (error: any) {

            return {
                job_id: job.id,
                attempt_number: job.current_attempts + 1,
                started_at: startTime,
                finished_at: new Date(),
                status: StatusesEnum.STATUS_FAILED,
                http_status: null,
                response_body: null,
                error: error.name === 'AbortError' ? 'timeout' : error.message
            };

        } finally {
            clearTimeout(timeout);
        }

    }

}