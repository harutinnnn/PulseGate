import initDB from "../config/database";

export async function countRows(table: string, countConditions: string[], countValues: string[]): Promise<number> {

    try {

        const db = await initDB();

        let where = ""
        if (countConditions.length > 0) {
            where = `WHERE ${countConditions.join(' AND ')}`
        }


        const row = await db?.get(
            `
                SELECT COUNT(*) AS total
                FROM ${table} ${where}
            `,
            countValues
        )

        return row.total || 0;

    } catch (err) {
        return 0;
    }

}