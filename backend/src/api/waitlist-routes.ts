/**
 * Waitlist API Routes
 * 
 * Public endpoint for signup + Admin endpoints for management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { waitlistStorage } from './waitlist-storage';
import { requireAuth } from '../auth/middleware';

// ==================== Request Schemas ====================

const SignupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().optional(),
});

// ==================== Email Notifications (Stub) ====================

/**
 * Log signup notification
 * TODO: Replace with actual email service (SendGrid, Resend, etc.)
 */
function logSignupNotification(email: string, name?: string): void {
  console.log('📧 [EMAIL STUB] New waitlist signup:');
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name || 'N/A'}`);
  console.log('   TODO: Send welcome email to user');
  console.log('   TODO: Send notification to admin');
}

/**
 * Log status change notification
 * TODO: Replace with actual email service
 */
function logStatusChangeNotification(email: string, status: string): void {
  console.log('📧 [EMAIL STUB] Waitlist status changed:');
  console.log(`   Email: ${email}`);
  console.log(`   Status: ${status}`);
  console.log(`   TODO: Send ${status} email to user`);
}

// ==================== Route Handlers ====================

export async function registerWaitlistRoutes(app: FastifyInstance) {
  
  /**
   * POST /api/waitlist/signup
   * Public endpoint - no auth required
   * Add email to waitlist
   */
  app.post('/api/waitlist/signup', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = SignupSchema.parse(request.body);
      
      // Add to waitlist
      const entry = await waitlistStorage.addSignup(body.email, body.name);
      
      // Log notification (stub)
      logSignupNotification(entry.email, entry.name);
      
      request.log.info({ email: entry.email }, 'New waitlist signup');
      
      return reply.code(201).send({
        success: true,
        message: "You're on the waitlist! We'll be in touch soon.",
        data: {
          email: entry.email,
          signupDate: entry.signupDate,
        },
      });
    } catch (error: any) {
      request.log.error(error, 'Waitlist signup failed');
      
      // Handle duplicate email gracefully
      if (error.message === 'Email already on waitlist') {
        return reply.code(409).send({
          success: false,
          error: 'Email already registered',
          message: 'This email is already on the waitlist.',
        });
      }
      
      return reply.code(400).send({
        success: false,
        error: 'Signup failed',
        message: error.message,
      });
    }
  });

  /**
   * GET /api/admin/waitlist
   * Admin only - list all waitlist signups
   */
  app.get(
    '/api/admin/waitlist',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const entries = await waitlistStorage.getAll();
        
        // Sort by signup date (newest first)
        entries.sort((a, b) => 
          new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime()
        );
        
        return reply.send({
          success: true,
          data: entries,
          count: entries.length,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to fetch waitlist');
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch waitlist',
          message: error.message,
        });
      }
    }
  );

  /**
   * PATCH /api/admin/waitlist/:email
   * Admin only - update status or notes
   */
  app.patch<{ Params: { email: string } }>(
    '/api/admin/waitlist/:email',
    { preHandler: requireAuth },
    async (request, reply) => {
      try {
        const { email } = request.params;
        const body = UpdateStatusSchema.parse(request.body);
        
        const updated = await waitlistStorage.update(email, body);
        
        if (!updated) {
          return reply.code(404).send({
            success: false,
            error: 'Entry not found',
            message: `No waitlist entry found for ${email}`,
          });
        }
        
        // Log notification (stub)
        logStatusChangeNotification(email, body.status);
        
        request.log.info({ email, status: body.status }, 'Waitlist status updated');
        
        return reply.send({
          success: true,
          message: 'Waitlist entry updated',
          data: updated,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to update waitlist entry');
        return reply.code(400).send({
          success: false,
          error: 'Update failed',
          message: error.message,
        });
      }
    }
  );

  /**
   * DELETE /api/admin/waitlist/:email
   * Admin only - remove from waitlist
   */
  app.delete<{ Params: { email: string } }>(
    '/api/admin/waitlist/:email',
    { preHandler: requireAuth },
    async (request, reply) => {
      try {
        const { email } = request.params;
        
        const deleted = await waitlistStorage.delete(email);
        
        if (!deleted) {
          return reply.code(404).send({
            success: false,
            error: 'Entry not found',
            message: `No waitlist entry found for ${email}`,
          });
        }
        
        request.log.info({ email }, 'Waitlist entry deleted');
        
        return reply.send({
          success: true,
          message: 'Waitlist entry deleted',
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to delete waitlist entry');
        return reply.code(500).send({
          success: false,
          error: 'Delete failed',
          message: error.message,
        });
      }
    }
  );

  /**
   * GET /api/admin/waitlist/stats
   * Admin only - get waitlist statistics
   */
  app.get(
    '/api/admin/waitlist/stats',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = await waitlistStorage.getStats();
        
        return reply.send({
          success: true,
          data: stats,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to fetch waitlist stats');
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch stats',
          message: error.message,
        });
      }
    }
  );
}
