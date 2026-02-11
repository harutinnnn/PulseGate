create table if not exists jobs
(
    id                     varchar(255)
        primary key,
    tenant_id              varchar(255)              not null,
    type                   varchar(255)              not null,
    status                 text    default 'pending' not null,
    payload_order_id       integer,
    payload_status         varchar(255),
    destination_url        varchar(255)              not null,
    destination_method     varchar(255)              not null,
    destination_headers    varchar(255)              not null,
    destination_timeout_ms integer,
    dedupe_key             varchar(255),
    execute_at             datetime                  not null,
    created_at             datetime                  not null,
    updated_at             datetime                  not null,
    max_attempts           integer                   not null,
    current_attempts       integer default '0'       not null,
    base_delay_ms          integer                   not null,
    max_delay_ms           integer                   not null,
    rate_limit_rps         float,
    rate_limit_burst       integer,
    last_error             varchar(255),
    idempotency_key        varchar(255),
    check (`status` in ('pending', 'scheduled', 'queued', 'processing', 'success', 'dlq', 'failed', 'canceled'))
);

create index idx_dedupe
    on jobs (dedupe_key, created_at);

create index idx_idempotency
    on jobs (tenant_id, idempotency_key);

create index idx_tenant_status
    on jobs (tenant_id, status);

create index jobs_execute_at_index
    on jobs (execute_at);

