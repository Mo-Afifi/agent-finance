/**
 * User & Authentication API Routes
 * 
 * Handles user registration, API key management, and user info
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { userStorage } from '../auth/storage';
import { requireAuth } from '../auth/middleware';

// ==================== Request Schemas ====================

const RegisterUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  googleId: z.string().optional(),
});

// ==================== Route Handlers ====================

export async function registerUserRoutes(app: FastifyInstance) {
  
  /**
   * POST /api/users/register
   * Register or get existing user by email (called after Google OAuth)
   * Returns userId, apiKey, email
   */
  app.post('/api/users/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterUserSchema.parse(request.body);
      
      // Create or get existing user
      const user = await userStorage.upsertUser(body.email);
      
      return reply.code(200).send({
        success: true,
        data: {
          userId: user.userId,
          email: user.email,
          apiKey: user.apiKey,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      request.log.error(error, 'User registration failed');
      return reply.code(400).send({
        success: false,
        error: 'Registration failed',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/users/me
   * Get current user info (requires API key)
   */
  app.get(
    '/api/users/me',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const user = await userStorage.getUserById(request.user.userId);

        if (!user) {
          return reply.code(404).send({
            success: false,
            error: 'User not found',
          });
        }

        return reply.send({
          success: true,
          data: {
            userId: user.userId,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to get user');
        return reply.code(500).send({
          success: false,
          error: 'Failed to get user',
          message: error.message,
        });
      }
    }
  );

  /**
   * GET /api/users/me/api-key
   * Get user's API key (requires API key)
   */
  app.get(
    '/api/users/me/api-key',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const user = await userStorage.getUserById(request.user.userId);

        if (!user) {
          return reply.code(404).send({
            success: false,
            error: 'User not found',
          });
        }

        return reply.send({
          success: true,
          data: {
            apiKey: user.apiKey,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to get API key');
        return reply.code(500).send({
          success: false,
          error: 'Failed to get API key',
          message: error.message,
        });
      }
    }
  );

  /**
   * POST /api/users/me/api-key/regenerate
   * Regenerate user's API key (requires current API key)
   */
  app.post(
    '/api/users/me/api-key/regenerate',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const user = await userStorage.regenerateApiKey(request.user.userId);

        if (!user) {
          return reply.code(404).send({
            success: false,
            error: 'User not found',
          });
        }

        return reply.send({
          success: true,
          data: {
            apiKey: user.apiKey,
            updatedAt: user.updatedAt,
          },
          message: 'API key regenerated successfully. Please update your applications.',
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to regenerate API key');
        return reply.code(500).send({
          success: false,
          error: 'Failed to regenerate API key',
          message: error.message,
        });
      }
    }
  );
}
