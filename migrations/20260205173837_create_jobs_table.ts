import type {Knex} from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("jobs", (table) => {
        table.increments("id").primary();
        table.string("tenant_id").notNullable();
        table.string("type").nullable();
        table.enum("status", ['pending', 'scheduled', 'queued', 'processing', 'success', 'dlq'])
            .notNullable().defaultTo('pending');//pending|scheduled|queued|processing|success|dlq
        table.datetime("created_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table.datetime("updated_at").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
        table.integer("attempts").defaultTo(0);
        table.integer("max_attempts").defaultTo(0);
        table.string("last_error").nullable();//enum?
        table.string("destination").nullable();//"destination": { "url": "https://example.com/webhook", "method": "POST" }
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("jobs");
}

