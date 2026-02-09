import {StatusesEnum} from "../enums/statuses.enum";
import {AppContext} from "../interfaces/app.context.interface";
import JobRepository from "../repositories/job.repository";


export default class TaskScheduler {

    private intervalId: NodeJS.Timeout | null = null;
    private jobRepo: JobRepository;

    constructor(context: AppContext) {
        this.jobRepo = context.jobRepo

    }


    start(pollMs: number = 5000): void {
        this.intervalId = setInterval(() => this.tick(), pollMs);
    }

    stop(): void {
        if (this.intervalId) clearInterval(this.intervalId);
    }


    private async tick(): Promise<void> {

        const formatedDate = new Date().toISOString().split('.')[0] + 'Z';

        // const data = this.db.prepare("SELECT * FROM jobs WHERE created_at <= ? AND status = ? LIMIT 5").all(formatedDate, StatusesEnum.STATUS_PENDING)


    }

}