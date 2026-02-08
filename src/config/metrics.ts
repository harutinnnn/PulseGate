import client from 'prom-client'

export const register = new client.Registry()

client.collectDefaultMetrics({
    register,
    prefix: 'app_',
})

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
