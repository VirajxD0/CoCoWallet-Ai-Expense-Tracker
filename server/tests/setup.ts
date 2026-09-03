import dotenv from 'dotenv'
import path from 'path'

// Load test env before anything imports env.ts
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })

// Default test env vars if not provided
process.env.NODE_ENV = 'test'
process.env.PORT = process.env.PORT || '3001'
process.env.API_VERSION = process.env.API_VERSION || 'v1'
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
process.env.DB_HOST = process.env.DB_HOST || 'localhost'
process.env.DB_PORT = process.env.DB_PORT || '3306'
process.env.DB_USER = process.env.DB_USER || 'test'
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test'
process.env.DB_NAME = process.env.DB_NAME || 'test'
process.env.DB_SSL = process.env.DB_SSL || 'false'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-at-least-32-chars-long!!'
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-chars!!'
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key'
process.env.LOG_LEVEL = 'fatal'
