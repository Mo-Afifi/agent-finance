/**
 * Agent Finance API Server
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { AgentFinanceSDK } from './sdk/agent-finance';
import { registerRoutes } from './api/routes';
import { registerAdminRoutes } from './api/admin-routes';
import { registerUserRoutes } from './api/user-routes';

// Load environment variables
dotenv.config({ path: '../../.env' });

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  // Initialize Fastify
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Initialize Agent Finance SDK
  const sdk = new AgentFinanceSDK({
    apiKey: process.env.HIFI_API_KEY || '',
    baseUrl: process.env.HIFI_BASE_URL || 'https://sandbox.hifibridge.com',
    environment: (process.env.HIFI_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  });

  // Register routes
  await registerUserRoutes(app);
  await registerRoutes(app, sdk);
  await registerAdminRoutes(app, sdk);

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.code(500).send({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  });

  // Start server
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Agent Finance API running on http://${HOST}:${PORT}`);
    app.log.info(`📊 Environment: ${process.env.HIFI_ENVIRONMENT || 'sandbox'}`);
    app.log.info(`🔐 HIFI Base URL: ${process.env.HIFI_BASE_URL}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
