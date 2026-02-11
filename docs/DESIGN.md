# PulseGate Architecture

PulseGate is a backend service designed for reliable webhook delivery.

## Architecture

- **Scheduler**: Min-heap for ordered delay processing.
- **Queue**: In-memory bounded channel with backpressure.
- **Worker Pool**: Async workers for concurrent delivery.
- **Delivery**: HTTP client with timeouts and rate limiting.
- **Reliability**: Exponential backoff retry logic and DLQ.
- **Deduplication**: LRU+TTL cache to prevent duplicate processing.
- **Idempotency**: Key-based lookup to ensure single execution.

## Design Decisions

1. **Why Min-Heap over Sorted Set (Redis)?**
    - Lower operational complexity (no Redis dependency).
    - In-memory processing is faster for high throughput.
    - Persistence is handled by SQLite periodic polling.

2. **Why SQLite?**
    - High performance with `better-sqlite3` synchronous driver.
    - Simplified deployment (single file database).
    - Suffient for tens of thousands of jobs per day.

3. **Rate Limiting**
    - Token bucket algorithm allows for bursts while maintaining average rate.
    - Distributed rate limiting is not currently supported (single instance design).
