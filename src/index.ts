import express, {NextFunction, Request, Response} from 'express'

import {initDB} from './config/database';

const app = express();


let dbConnected = false;

import cors from 'cors';

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
};


app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.get('/', async (req: Request, res: Response, next: NextFunction) => {
    next()
})


app.get('/healthz', async (req: Request, res: Response) => {
    res.status(200).json({status: 'ok'})
})


app.get('/readyz', async (req: Request, res: Response) => {
    if (dbConnected) {
        res.status(200).json({status: 'ready'})
    } else {
        res.status(503).json({status: 'not ready'})
    }
})


/**
 * @description routing api
 */
import {JobApi} from './routes/v1/index';

app.use('/v1', JobApi)



initDB().then(async () => {

    dbConnected = true;

    const PORT: any = process.env.PORT || 3000
    app.listen(80)
    app.listen(433, () => {
        console.log(`Listening on port ${PORT}`)
    })

}).catch((error: unknown) => {

    dbConnected = false;

    if (error instanceof Error) {
        console.log("Error message:", error.message);
    } else {
        console.log("Unknown error", error);
    }
});