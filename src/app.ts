import express, {NextFunction, Request, Response} from 'express'
import https, {ServerOptions as HttpsServerOptions} from 'https'
import http, {IncomingMessage, ServerResponse} from 'http'
import fs from 'fs'
import path from 'path'
import 'dotenv/config';
import {checkDbReady} from "./db/index";

import logger from "./config/logger";
import './config/database';

import {register, httpRequestDuration, httpRequestTotal} from './config/metrics'

const app = express();


import cors from 'cors';

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
};


app.use(cors(corsOptions));


app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({extended: true}));


//Prometheus metrics
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer({method: req.method})

    res.on('finish', () => {
        end({
            route: req.route?.path || req.path,
            status: res.statusCode,
        })

        httpRequestTotal.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
        })
    })

    next()
})


app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})
//END Prometheus metrics


//TODO disallow PUT and PATCH request types
// const bannedMethods = ['PUT', 'PATCH'];
//
// app.use((req, res, next) => {
//     if (bannedMethods.includes(req.method)) {
//         res.setHeader('Allow', 'GET, POST, DELETE'); // Good practice to tell the client what IS allowed
//         return res.status(405).end();
//     }
//     next();
// });


//Https redirection
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


// import {checkDbReady} from "./utils/health.utility";

app.get('/healthz', (_req, res) => {
    res.status(200).json({status: 'ok'})
})

app.get('/readyz', async (_req, res) => {
    if (checkDbReady()) {
        res.status(200).json({
            status: 'ready',
            db: 'up',
        })
    } else {
        return res.status(503).json({
            status: 'not-ready',
            db: 'down',
        })
    }
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

//TODO temporary disabeled 80,443 ports
// httpServer.listen(80, '0.0.0.0', () => {
//     console.log('HTTP redirect server running on port 80')
// })
//
// httpsServer.listen(443, '0.0.0.0', () => {
//     console.log('HTTPS server running on port 443')
// })

export default app;