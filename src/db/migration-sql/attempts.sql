create table if not exists attempts
(
    id             integer      not null
        primary key autoincrement,
    job_id         text         not null
        references jobs,
    attempt_number integer      not null,
    started_at     datetime,
    finished_at    datetime,
    status         varchar(255) not null,
    http_status    integer,
    error          varchar(255),
    response_body  varchar(255)
);

create index if not exists idx_job_attempts
    on attempts (job_id, attempt_number);

