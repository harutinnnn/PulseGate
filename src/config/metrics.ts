import client from 'prom-client'

// Create a Registry (recommended)
export const register = new client.Registry()

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({
    register,
    prefix: 'app_', // optional prefix
})

// Custom metrics examples
export const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5],
})

export const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
})

// Register custom metrics
register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)
