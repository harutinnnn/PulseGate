import initDB from '../config/database'

export async function checkDbReady(): Promise<boolean> {

    return new Promise(async (resolve, reject) => {

        try {

            const db = await initDB();

            if (db) {
                await db.get('SELECT 1')
                resolve(true)
            } else {
                console.error('❌ DB not ready:')
                reject(false)
            }
        } catch (err) {
            console.error('❌ DB not ready:', err)
            reject(false)
        }
    })
}
