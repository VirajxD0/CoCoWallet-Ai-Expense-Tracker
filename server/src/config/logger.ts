import pino from 'pino';
import { env } from './env';

/**
 * Pino logger — structured JSON logging for production.
 *
 * In development: pretty-printed, human-readable.
 * In production: JSON lines for log aggregation (Datadog, ELK, etc.).
 */
const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
});

export default logger;
