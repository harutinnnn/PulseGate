import Database from "better-sqlite3";
import {StatusesEnum} from "../enums/statuses.enum";
import {AppContext} from "../interfaces/app.context.interface";


export default class TaskScheduler {

    private intervalId: NodeJS.Timeout | null = null;
    private db: Database.Database;

    constructor(context: AppContext) {
        this.db = context.db

    }


    start(pollMs: number = 5000): void {
        this.intervalId = setInterval(() => this.tick(), pollMs);
    }

    stop(): void {
        if (this.intervalId) clearInterval(this.intervalId);
    }


    private async tick(): Promise<void> {

        const formatedDate = new Date().toISOString().split('.')[0] + 'Z';

        const data = this.db.prepare("SELECT * FROM jobs WHERE created_at <= ? AND status = ? LIMIT 5").all(formatedDate, StatusesEnum.STATUS_PENDING)


    }

}