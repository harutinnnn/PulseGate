# PulseGate Runbook

Operational guide for PulseGate service.

## Key Metrics

- `pulsegate_queue_depth`: Should be low (<10). High depth indicates backpressure.
- `pulsegate_jobs_in_flight`: Should match worker concurrency if active processing.
- `pulsegate_retries_total`: Spikes might mean external service outage.
- `pulsegate_dlq_count`: Investigate these jobs manually.

## Debugging

### High Queue Depth
1. Check webhook destination latencies.
2. Check worker pool utilization.
3. Check database performance (disk I/O).

### Delivery Failures
Use logs to correlate `request_id` with application errors.

### Manual Retry
Jobs in DLQ can be retried via `/v1/jobs/:id/retry` endpoint.
