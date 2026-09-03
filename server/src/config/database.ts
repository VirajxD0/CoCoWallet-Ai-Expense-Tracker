import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from './env';
import logger from './logger';

/**
 * MySQL connection pool — single pool for the entire application.
 * Uses connection pooling for performance and reliability.
 */
let pool: mysql.Pool;

function getSslConfig(): any {
  if (env.DB_SSL !== 'true') return undefined;
  try {
    const candidates = [
      path.resolve(__dirname, '../../certs/ca.pem'), // src: server/src/config -> server/certs | dist: /app/dist/config -> /app/certs
      path.resolve(process.cwd(), 'certs/ca.pem'),   // cwd = server/
      path.resolve(process.cwd(), 'server/certs/ca.pem'), // cwd = newProj/
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const ca = fs.readFileSync(p);
        logger.info({ path: p }, '🔒 MySQL SSL: CA verification enabled');
        return { ca, rejectUnauthorized: true };
      }
    }
    logger.warn('⚠️  CA not found — using SSL with rejectUnauthorized:false (still encrypted)');
    return { rejectUnauthorized: false };
  } catch (e) {
    logger.warn({ err: e }, '⚠️  CA read failed — fallback to rejectUnauthorized:false');
    return { rejectUnauthorized: false };
  }
}

export function initDatabase(): mysql.Pool {
  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+00:00',
    ssl: getSslConfig(),
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

  logger.info('✅ MySQL pool initialized');
  return pool;
}

export function getPool(): mysql.Pool {
  if (!pool) throw new Error('MySQL pool not initialized. Call initDatabase() first.');
  return pool;
}

/**
 * Execute a query with parameters.
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

/**
 * Execute a query and return a single row.
 */
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

/**
 * Execute an INSERT and return the insert ID.
 */
export async function insert(sql: string, params?: any[]): Promise<string> {
  const [result] = await getPool().execute(sql, params) as any;
  return result.insertId;
}

/**
 * Execute an INSERT and return the insert ID as UUID.
 */
export async function insertWithId(sql: string, params?: any[]): Promise<void> {
  await getPool().execute(sql, params);
}

/**
 * Execute an UPDATE or DELETE and return affected rows count.
 */
export async function execute(sql: string, params?: any[]): Promise<number> {
  const [result] = await getPool().execute(sql, params) as any;
  return result.affectedRows;
}

/**
 * Get a connection from the pool (for transactions).
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  return getPool().getConnection();
}
