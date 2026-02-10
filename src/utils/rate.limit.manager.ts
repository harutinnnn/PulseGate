export class RateLimitManager {
    private buckets = new Map<string, {
        tokens: number;
        lastRefill: number;
        rps: number;
        burst: number;
    }>();

    allow(destination: string, rps?: number, burst?: number): boolean {
        if (!rps) return true;

        const now = Date.now();
        let bucket = this.buckets.get(destination);

        if (!bucket) {
            bucket = {
                tokens: burst || 1,
                lastRefill: now,
                rps,
                burst: burst || 1
            };
            this.buckets.set(destination, bucket);
        } else {
            // Update limits if they changed (optional, but good for robustness)
            bucket.rps = rps;
            bucket.burst = burst || 1;
        }

        const elapsedSeconds = (now - bucket.lastRefill) / 1000;

        // Refill tokens
        bucket.tokens = Math.min(bucket.burst, bucket.tokens + (elapsedSeconds * bucket.rps));
        bucket.lastRefill = now;

        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            return true;
        }

        return false;
    }
}
