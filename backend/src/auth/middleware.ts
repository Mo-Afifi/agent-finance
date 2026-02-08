/**
 * API Key Authentication Middleware
 * 
 * Validates Bearer tokens (API keys) and attaches user info to request
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { userStorage } from './storage';

// Extend Fastify request with user info
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      apiKey: string;
    };
  }
}

/**
 * Extract API key from Authorization header
 */
function extractApiKey(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer opay_xxx..."
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const apiKey = parts[1];
  
  // Validate format
  if (!apiKey.startsWith('opay_')) {
    return null;
  }

  return apiKey;
}

/**
 * Authentication middleware
 * Requires valid API key in Authorization header
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const apiKey = extractApiKey(request);

    if (!apiKey) {
      return reply.code(401).send({
        success: false,
        error: 'Missing or invalid Authorization header',
        message: 'Expected format: Authorization: Bearer opay_xxx...',
      });
    }

    // Validate API key
    const user = await userStorage.getUserByApiKey(apiKey);

    if (!user) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
      });
    }

    // Attach user to request
    request.user = {
      userId: user.userId,
      email: user.email,
      apiKey: user.apiKey,
    };
  } catch (error: any) {
    request.log.error(error, 'Authentication error');
    return reply.code(500).send({
      success: false,
      error: 'Authentication failed',
      message: error.message,
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if API key is valid, but doesn't require it
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const apiKey = extractApiKey(request);

    if (apiKey) {
      const user = await userStorage.getUserByApiKey(apiKey);
      
      if (user) {
        request.user = {
          userId: user.userId,
          email: user.email,
          apiKey: user.apiKey,
        };
      }
    }
  } catch (error: any) {
    // Log but don't fail - optional auth
    request.log.warn(error, 'Optional auth failed');
  }
}
