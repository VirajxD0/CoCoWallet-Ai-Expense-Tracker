import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import hpp from 'hpp';
import { env } from './config/env';
import { apiLimiter, speedLimiter } from './common/middleware/rateLimiter';
import { errorHandler } from './common/middleware/errorHandler';
import { requestId } from './common/middleware/requestId';
import { swaggerSpec } from './config/swagger';
import swaggerUi from 'swagger-ui-express';

// Import route modules
import authRoutes from './modules/auth/auth.routes';
import expensesRoutes from './modules/expenses/expenses.routes';
import budgetsRoutes from './modules/budgets/budgets.routes';
import aiRoutes from './modules/ai/ai.routes';

/**
 * Express application configuration.
 * Separated from server.ts for testability.
 */
const app = express();

// ─── Security Middleware ────────────────────────────────────────────────
app.use(helmet());                          // Secure HTTP headers
app.use(hpp());                             // HTTP Parameter Pollution protection
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,                        // Allow cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────
app.use(apiLimiter);                        // General rate limit: 100 req/15min
app.use(speedLimiter);                      // Progressive slowdown after 50 req

// ─── Request Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));    // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Compression ────────────────────────────────────────────────────────
app.use(compression());                     // Gzip responses

// ─── Logging ────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Request ID ─────────────────────────────────────────────────────────
app.use(requestId);

// ─── API Documentation ──────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Expense Tracker API Docs',
}));

// ─── Health Check ───────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────
const apiPrefix = `/api/${env.API_VERSION}`;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/expenses`, expensesRoutes);
app.use(`${apiPrefix}/budgets`, budgetsRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: 'Route not found',
  });
});

// ─── Global Error Handler (must be last) ────────────────────────────────
app.use(errorHandler);

export default app;
