import winston from 'winston';
import config from './config';
import { LoggerOptionsWithTransports } from 'express-winston';
import expressWinston from 'express-winston';
import { Request, Response } from 'express';

// Use the RFC standard syslogs
// https://github.com/winstonjs/winston#logging-levels
const logLevels = winston.config.syslog.levels;
const configLevel = config?.LOG_LEVEL;
// levels > warning means notice, info, or debug.
export const SendVerboseLogs = logLevels[configLevel] > logLevels.warning;

const skipInfoLogs = (_req: Request, res: Response) => {
  return res.statusCode <= 200;
};

/**
 * apiLogger is used for server logs that are generated by the API
 * and handles log levels automatically
 */
export const apiLogger = winston.createLogger({
  levels: logLevels,
  level: config?.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});

/**
 * requestLogger is exclusively responsible for logging requests from express.
 */
export const requestLogger = expressWinston.logger({
  level: config?.LOG_LEVEL,
  transports: [new winston.transports.Console()],
  requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  meta: false,
  msg: 'HTTP {{req.method}} {{res.statusCode}} {{req.url}}',
  skip: SendVerboseLogs
    ? () => {
        return false;
      }
    : skipInfoLogs,
} as LoggerOptionsWithTransports);
