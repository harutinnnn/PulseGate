import express from 'express'
import 'dotenv/config';
import {checkDbReady} from "./db/index";
import './config/database';
import {register, httpRequestDuration, httpRequestTotal} from './config/metrics'
import {jobRoute} from './routes/v1/job';
import {AppContext} from "./interfaces/app.context.interface";
import cors from 'cors';
import {healthCheck, metricsHandler, readinessCheck} from "./routes/health";

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


    app.use('/v1', jobRoute(context))


    app.get('/healthz', healthCheck);
    app.get('/readyz', readinessCheck);
    app.get('/metrics', metricsHandler);

    return app;
}