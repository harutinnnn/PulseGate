import { createLogger, format, transports, Logger } from 'winston';

// Define custom log levels (optional)
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Create the logger instance
const logger: Logger = createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }), // Capture stack trace for errors
        format.splat(),                // Support for string interpolation
        format.json()                  // Log in JSON for easy parsing in production
    ),
    transports: [
        // Write all logs with level 'error' and below to error.log
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Write all logs to combined.log
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If we're not in production, also log to the console with colors
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, stack }) => {
                return `${timestamp} [${level}]: ${stack || message}`;
            })
        ),
    }));
}

export default logger;