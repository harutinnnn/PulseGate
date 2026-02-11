# PulseGate

A production-ready webhook dispatch service with reliability, observability, and advanced features.

## Features

- ✅ **Reliable Delivery**: Exponential backoff retry logic with configurable attempts
- ✅ **Scheduled Execution**: Delay job execution to future timestamps
- ✅ **Deduplication**: LRU+TTL cache to prevent duplicate processing
- ✅ **Idempotency**: Key-based request deduplication
- ✅ **Rate Limiting**: Token bucket algorithm per destination
- ✅ **Dead Letter Queue**: Failed jobs isolation for manual review
- ✅ **Observability**: Prometheus metrics and structured JSON logging
- ✅ **Graceful Shutdown**: No job loss on SIGTERM/SIGINT

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Copy environment configuration
cp .env.example .env

# Start the service
npm start
```

### Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## Docker Deployment

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose down
```

## API Usage

### Create a Job

```bash
curl -X POST http://localhost:8080/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-key-123" \
  -d '{
    "tenant_id": "demo",
    "type": "webhook.dispatch",
    "payload": {"order_id": 42, "status": "completed"},
    "destination": {
      "url": "https://webhook.site/your-unique-id",
      "method": "POST",
      "timeout_ms": 5000
    },
    "retry": {
      "max_attempts": 5,
      "base_delay_ms": 1000,
      "max_delay_ms": 30000
    },
    "rate_limit": {
      "rps": 10,
      "burst": 20
    }
  }'
```

### List Jobs

```bash
curl "http://localhost:8080/v1/jobs?tenant_id=demo&limit=10&status=success"
```

### Get Job Details

```bash
curl http://localhost:8080/v1/jobs/{job_id}
```

### Get Delivery Attempts

```bash
curl http://localhost:8080/v1/jobs/{job_id}/attempts
```

### Cancel a Job

```bash
curl -X POST http://localhost:8080/v1/jobs/{job_id}/cancel
```

### Retry a Failed Job

```bash
curl -X POST http://localhost:8080/v1/jobs/{job_id}/retry
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8080 | HTTP server port |
| `DATABASE_PATH` | ./pulsegate.db | SQLite database file path |
| `QUEUE_CAPACITY` | 10000 | Max in-memory queue size |
| `WORKER_CONCURRENCY` | 20 | Number of concurrent workers |
| `SCHEDULER_POLL_INTERVAL_MS` | 5000 | How often to poll for scheduled jobs |
| `DEDUPE_WINDOW_SECONDS` | 3600 | Deduplication cache TTL |
| `LOG_LEVEL` | info | Log level (debug, info, warn, error) |

## Monitoring

### Health Checks

- **Liveness**: `GET /healthz` - Returns 200 if process is alive
- **Readiness**: `GET /readyz` - Returns 200 if service is ready

### Metrics

Prometheus metrics available at `GET /metrics`:

- `pulsegate_queue_depth` - Current jobs in memory queue
- `pulsegate_jobs_in_flight` - Jobs being processed
- `pulsegate_jobs_created_total` - Total jobs created
- `pulsegate_jobs_completed_total` - Jobs by final status
- `pulsegate_delivery_duration_seconds` - Webhook delivery latency

## Architecture

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌────────┐
│ API     │───▶│ Validator│───▶│ Scheduler │───▶│ Queue  │
│ Server  │    │ + Dedupe │    │ (Min-Heap)│    │ (FIFO) │
└─────────┘    └──────────┘    └───────────┘    └────────┘
                                                      │
                                                      ▼
┌──────────┐   ┌──────────┐   ┌──────────────┐   ┌────────┐
│ Database │◀──│  Worker  │◀──│ Rate Limiter │◀──│ Worker │
│ (SQLite) │   │   Pool   │   │ (Token       │   │  Pool  │
└──────────┘   └──────────┘   │  Bucket)     │   └────────┘
                               └──────────────┘
```

## Documentation

- [Design Decisions](docs/DESIGN.md)
- [Operational Runbook](docs/RUNBOOK.md)
- [API Reference](openapi/openapi.yaml)

## License

MIT
