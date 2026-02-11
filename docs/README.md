# PulseGate

A comprehensive webhook dispatch service with reliability, observability, and advanced features.

## Getting Started

### Quick Start with Docker Compose

1. Clone the repository
2. Run `docker-compose up -d`
3. Access the API at http://localhost:8080

### Environment Variables

See `.env.example` for details.

### API Usage

#### Create a Job

```bash
curl -X POST http://localhost:8080/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "demo",
    "type": "test_job",
    "payload": {"hello": "world"},
    "destination": {
      "url": "https://webhook.site/unique-id",
      "method": "POST"
    }
  }'
```

See `openapi/openapi.yaml` for full API definition.
