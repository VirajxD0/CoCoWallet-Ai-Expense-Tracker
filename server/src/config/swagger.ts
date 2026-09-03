import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

/**
 * Swagger/OpenAPI configuration.
 * Auto-generates API docs from JSDoc annotations in route files.
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Expense Tracker API',
      version: '1.0.0',
      description: 'Production-grade REST API for AI-powered expense tracking',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      responses: {
        Unauthorized: {
          description: 'Unauthorized — invalid or missing token',
        },
        NotFound: {
          description: 'Resource not found',
        },
        ValidationError: {
          description: 'Validation error in request body',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
