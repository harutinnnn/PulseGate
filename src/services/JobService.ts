import JobInterface from "../interfaces/JobInterface";
import {initDB} from '../config/database';


export default class JobService {

    async getJob(id: number): Promise<JobInterface | undefined> {

        const db = await initDB();

        try {

            return await db.get("SELECT * FROM jobs WHERE id = ?", [id]);

        } catch (err) {

            return undefined;
        }


    }


}