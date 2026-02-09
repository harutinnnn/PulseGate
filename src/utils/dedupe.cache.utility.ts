import { LRUCache } from 'lru-cache';

interface DedupeEntry {
    jobID: string;
}

export class DedupeCache {
    private cache: LRUCache<string, DedupeEntry>;

    constructor(maxSize: number, ttlMs: number) {
        this.cache = new LRUCache<string, DedupeEntry>({
            max: maxSize,
            ttl: ttlMs,
            updateAgeOnGet: false
        });
    }

    check(key: string): string | undefined {
        const entry = this.cache.get(key);
        return entry ? entry.jobID : undefined;
    }

    set(key: string, jobID: string): void {
        this.cache.set(key, { jobID });
    }
}
