import express, {NextFunction, Request, Response} from 'express'
import https, {ServerOptions as HttpsServerOptions} from 'https'
import http, {IncomingMessage, ServerResponse} from 'http'
import fs from 'fs'
import path from 'path'

import {Database} from "sqlite";

import initDB from './config/database';

const app = express();


let dbReady = false;

let db: Database | null;
(async () => {
    db = await initDB();
    if (db) {
        dbReady = true;
    }
})()


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


const httpServer = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => {
        if (!req.headers.host || !req.url) {
            res.writeHead(400)
            res.end()
            return
        }

        res.writeHead(301, {
            Location: `https://${req.headers.host}${req.url}`,
        })
        res.end()
    }
)


app.get('/healthz', async (req: Request, res: Response) => {
    res.status(200).json({status: 'ok'})
})


const checkDb = (): Promise<boolean> =>
    new Promise(async (resolve) => {
        try {

            if (db) {
                await db.get('SELECT 1')
                resolve(true)

            } else {
                resolve(false)
            }
        } catch (err) {
            console.error('ERR', err)
            resolve(false)
        }
    })


app.get('/readyz', async (req: Request, res: Response) => {

    if (!dbReady) {
        return res.status(503).json({
            status: 'not ready',
            reason: 'db not connected',
        })
    }

    const dbOk = await checkDb();

    console.log('dbOk', dbOk)

    if (!dbOk) {
        return res.status(503).json({
            status: 'not ready',
            reason: 'db query failed',
        })
    }

    return res.status(200).json({status: 'ready'})
})

/**
 * @description routing api
 */
import {JobApi} from './routes/v1/index';

app.use('/v1', JobApi)


const httpsOptions: HttpsServerOptions = {
    key: fs.readFileSync(path.resolve('ssl/key.pem')),
    cert: fs.readFileSync(path.resolve('ssl/cert.pem')),
}

const httpsServer = https.createServer(httpsOptions, app);

httpServer.listen(80, '0.0.0.0', () => {
    console.log('HTTP redirect server running on port 80')
})

httpsServer.listen(443, '0.0.0.0', () => {
    console.log('HTTPS server running on port 443')
})
