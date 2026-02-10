import { EventEmitter } from 'events';
import {JobType} from "../types/job.type";

export class MemoryQueue extends EventEmitter {
    private jobs: JobType[] = [];

    constructor(private capacity: number) {
        super();
    }

    enqueue(job: JobType): boolean {
        if (this.jobs.length >= this.capacity) {
            return false;
        }

        this.jobs.push(job);
        this.emit('job', job);
        return true;
    }

    dequeue(): JobType | undefined {
        return this.jobs.shift();
    }

    get depth(): number {
        return this.jobs.length;
    }
}
