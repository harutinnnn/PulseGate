import swaggerJsdoc from "swagger-jsdoc";
import {Options} from "swagger-jsdoc";

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
        },
        components: {
            schemas: {
                AddJobRequest: {
                    type: "object",
                    required: ["tenant_id", "type", "payload", "destination"],
                    properties: {
                        tenant_id: {
                            type: "string",
                            example: "t_123",
                        },
                        type: {
                            type: "string",
                            example: "webhook.dispatch",
                        },
                        payload: {
                            type: "object",
                            additionalProperties: true,
                            example: {
                                order_id: 42,
                                status: "paid",
                            },
                        },
                        destination: {
                            type: "object",
                            required: ["url", "method"],
                            properties: {
                                url: {
                                    type: "string",
                                    format: "uri",
                                    example: "https://example.com/webhook",
                                },
                                method: {
                                    type: "string",
                                    enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                                    example: "POST",
                                },
                                headers: {
                                    type: "object",
                                    additionalProperties: {
                                        type: "string",
                                    },
                                    example: {
                                        "X-Signature": "...",
                                    },
                                },
                                timeout_ms: {
                                    type: "integer",
                                    example: 5000,
                                },
                            },
                        },
                        dedupe_key: {
                            type: "string",
                            example: "order:42:paid",
                        },
                        execute_at: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-02T12:00:00Z",
                        },
                        retry: {
                            type: "object",
                            properties: {
                                max_attempts: {
                                    type: "integer",
                                    example: 8,
                                },
                                base_delay_ms: {
                                    type: "integer",
                                    example: 500,
                                },
                                max_delay_ms: {
                                    type: "integer",
                                    example: 30000,
                                },
                            },
                        },
                        rate_limit: {
                            type: "object",
                            properties: {
                                rps: {
                                    type: "integer",
                                    example: 5,
                                },
                                burst: {
                                    type: "integer",
                                    example: 10,
                                },
                            },
                        },
                    },
                },
                JobsListResponse: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Job",
                            },
                        },
                        next_cursor: {
                            type: "string",
                            nullable: true,
                            example: "eyJpZCI6IjEyNCJ9",
                        },
                        has_more: {
                            type: "boolean",
                            example: true,
                        },
                    },
                },
                Job: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            example: "job_123",/**
                             * @openapi
                             * /v1/jobs:
                             *   get:
                             *     summary: List webhook jobs
                             *     description: Returns paginated list of webhook jobs.
                             *     tags:
                             *       - Jobs
                             *     parameters:
                             *       - in: query
                             *         name: tenant_id
                             *         required: true
                             *         schema:
                             *           type: string
                             *         description: Tenant identifier
                             *         example: t_123
                             *
                             *       - in: query
                             *         name: limit
                             *         required: false
                             *         schema:
                             *           type: integer
                             *           minimum: 1
                             *           maximum: 100
                             *           default: 20
                             *         description: Number of results to return
                             *
                             *       - in: query
                             *         name: cursor
                             *         required: false
                             *         schema:
                             *           type: string
                             *         description: Pagination cursor
                             *         example: eyJpZCI6IjEyMyJ9
                             *
                             *       - in: query
                             *         name: status
                             *         required: false
                             *         schema:
                             *           type: string
                             *           enum: [pending, processing, completed, failed]
                             *         description: Filter by job status
                             *
                             *       - in: query
                             *         name: type
                             *         required: false
                             *         schema:
                             *           type: string
                             *         description: Filter by job type
                             *
                             *     responses:
                             *       200:
                             *         description: Paginated list of jobs
                             *         content:
                             *           application/json:
                             *             schema:
                             *               $ref: '#/components/schemas/JobsListResponse'
                             *       400:
                             *         description: Invalid query parameters
                             */

                        },
                        tenant_id: {
                            type: "string",
                            example: "t_123",
                        },
                        type: {
                            type: "string",
                            example: "webhook.dispatch",
                        },
                        status: {
                            type: "string",
                            enum: ["pending", "processing", "completed", "failed"],
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                        },
                        updated_at: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
                JobDetails: {
                    type: "object",
                    required: [
                        "id",
                        "tenant_id",
                        "type",
                        "status",
                        "created_at",
                        "attempts",
                        "max_attempts",
                        "destination"
                    ],
                    properties: {
                        id: {
                            type: "string",
                            example: "job_abc",
                        },
                        tenant_id: {
                            type: "string",
                            example: "t_123",
                        },
                        type: {
                            type: "string",
                            example: "webhook.dispatch",
                        },
                        status: {
                            type: "string",
                            enum: ["queued", "processing", "completed", "failed"],
                            example: "queued",
                        },
                        created_at: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-02T11:00:00Z",
                        },
                        execute_at: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                            example: "2026-02-02T12:00:00Z",
                        },
                        attempts: {
                            type: "integer",
                            example: 2,
                        },
                        max_attempts: {
                            type: "integer",
                            example: 8,
                        },
                        last_error: {
                            type: "string",
                            nullable: true,
                            example: "timeout",
                        },
                        destination: {
                            type: "object",
                            required: ["url", "method"],
                            properties: {
                                url: {
                                    type: "string",
                                    format: "uri",
                                    example: "https://example.com/webhook",
                                },
                                method: {
                                    type: "string",
                                    enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                                    example: "POST",
                                },
                            },
                        },
                    },
                },
                JobAttemptsResponse: {
                    type: "object",
                    properties: {
                        items: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/JobAttempt",
                            },
                        },
                    },
                },
                JobAttempt: {
                    type: "object",
                    required: ["n", "started_at", "status"],
                    properties: {
                        n: {
                            type: "integer",
                            description: "Attempt number",
                            example: 1,
                        },
                        started_at: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-02T12:00:01Z",
                        },
                        finished_at: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                            example: "2026-02-02T12:00:03Z",
                        },
                        status: {
                            type: "string",
                            enum: ["queued", "processing", "success", "failed"],
                            example: "failed",
                        },
                        http_status: {
                            type: "integer",
                            nullable: true,
                            example: 504,
                            description: "HTTP response status from destination",
                        },
                        error: {
                            type: "string",
                            nullable: true,
                            example: "timeout",
                        },
                    },
                },
                JobCancelResponse: {
                    type: "object",
                    required: ["id", "status"],
                    properties: {
                        id: {
                            type: "string",
                            example: "job_abc",
                        },
                        status: {
                            type: "string",
                            enum: ["cancelled"],
                            example: "cancelled",
                        },
                    },
                },
                JobRetryResponse: {
                    type: "object",
                    required: ["id", "status"],
                    properties: {
                        id: {
                            type: "string",
                            example: "job_abc",
                        },
                        status: {
                            type: "string",
                            enum: ["queued"],
                            example: "queued",
                        },
                    },
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"],
};


export const swaggerSpec = swaggerJsdoc(options);
