import app from './app';
import { env } from './config/env';
import { initDatabase } from './config/database';
import logger from './config/logger';

/**
 * Server entry point.
 * Initializes database pool, starts HTTP server, handles graceful shutdown.
 */

// Initialize MySQL connection pool
initDatabase();

// Create HTTP server
const server = app.listen(env.PORT, () => {
  logger.info(`
┌─────────────────────────────────────────────┐
│  🚀 CocoWallet API                          │
│  ─────────────────────────────────────────  │
│  Port:      ${env.PORT}                          │
│  Env:       ${env.NODE_ENV}                      │
│  DB:        MySQL (Aiven)                    │
│  API Docs:  http://localhost:${env.PORT}/api/docs  │
│  Health:    http://localhost:${env.PORT}/health    │
└─────────────────────────────────────────────┘
  `);
});

// ─── Graceful Shutdown ──────────────────────────────────────────────────
function gracefulShutdown(signal: string): void {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

export default server;
