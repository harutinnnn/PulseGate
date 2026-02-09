import express from 'express'
import 'dotenv/config';
import {checkDbReady} from "./db/index";
import './config/database';
import {register, httpRequestDuration, httpRequestTotal} from './config/metrics'
import {JobApi} from './routes/v1/index';
import {AppContext} from "./interfaces/app.context.interface";
import cors from 'cors';

export const createApp = (context: AppContext) => {


    const app = express();


    // CORS configuration
    const corsOptions = {
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
    };
    app.use(cors(corsOptions));

    app.use(express.json({limit: '256kb'}));
    app.use(express.urlencoded({extended: true}));

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

    app.use('/v1', JobApi)


    return app;
}