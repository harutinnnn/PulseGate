import type {Knex} from "knex";
import {StatusesEnum} from "../src/enums/statuses.enum";



export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("jobs", (table) => {
        table.string("id").primary();
        table.string("tenant_id").notNullable();
        table.string("type").notNullable();
        table.enum("status", ['pending', 'scheduled', 'queued', 'processing', 'success', 'dlq', 'failed', StatusesEnum.STATUS_CANCELED])
            .notNullable().defaultTo('pending');//pending|scheduled|queued|processing|success|dlq
        table.integer("payload_order_id").nullable();
        table.string("payload_status").nullable();
        table.string("destination_url").notNullable();
        table.string("destination_method").notNullable();
        table.string("destination_headers").notNullable();
        table.integer("destination_timeout_ms").nullable();
        table.string("dedupe_key").nullable();
        table.datetime("execute_at").notNullable().index();
        table.datetime("created_at").notNullable();
        table.datetime("updated_at").notNullable();
        table.integer("max_attempts").notNullable();
        table.integer("current_attempts").notNullable().defaultTo(0);
        table.integer("base_delay_ms").notNullable();
        table.integer("max_delay_ms").notNullable();
        table.float("rate_limit_rps").nullable();
        table.integer("rate_limit_burst").nullable();
        table.string("last_error").nullable();
        table.string("idempotency_key").nullable();


        table.index(["tenant_id", "status"], "idx_tenant_status");
        table.index(["dedupe_key", "created_at"], "idx_dedupe");
        table.index(["tenant_id", "idempotency_key"], "idx_idempotency");
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("jobs");
}
