import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("job_attempts", (table) => {
        table.increments("id").primary();
        table.text("job_id").notNullable();
        table.integer("attempt_number").notNullable();
        table.datetime("started_at").nullable();
        table.datetime("finished_at").nullable();
        table.string("status").notNullable();
        table.integer("http_status").nullable();
        table.string("error").nullable();
        table.string("response_body").nullable();


        table.index(["job_id", "attempt_number"], "idx_job_attempts");
        table.foreign('job_id').references('id').inTable('jobs')

    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("job_attempts");
}

