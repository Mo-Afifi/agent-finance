/**
 * Webhook Handler for HIFI Bridge Events
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export interface WebhookEvent {
  eventId: string;
  eventCategory: string;
  eventType: string;
  eventAction: string;
  data: any;
  createdAt: string;
  timestamp: string;
  version: string;
}

export type WebhookEventType =
  | 'USER.CREATE'
  | 'USER.UPDATE'
  | 'KYC.CREATE'
  | 'KYC.STATUS_UPDATE'
  | 'WALLET.TRANSFER.CREATE'
  | 'WALLET.TRANSFER.UPDATE'
  | 'WALLET.BALANCE.UPDATE'
  | 'ACCOUNT.CREATE'
  | 'ACCOUNT.UPDATE'
  | 'ONRAMP.CREATE'
  | 'ONRAMP.UPDATE'
  | 'OFFRAMP.CREATE'
  | 'OFFRAMP.UPDATE';

export type WebhookHandler = (event: WebhookEvent) => Promise<void> | void;

export class WebhookManager {
  private handlers: Map<WebhookEventType, WebhookHandler[]> = new Map();
  private publicKey?: string;

  constructor(publicKey?: string) {
    this.publicKey = publicKey;
  }

  /**
   * Register a handler for specific webhook event type
   */
  on(eventType: WebhookEventType, handler: WebhookHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Verify webhook signature
   */
  verifySignature(token: string): WebhookEvent {
    if (!this.publicKey) {
      throw new Error('Webhook public key not configured');
    }

    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as WebhookEvent;
      return decoded;
    } catch (error) {
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Extract JWT from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.code(401).send({ error: 'Missing or invalid authorization header' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      
      // Verify signature if public key is configured
      let event: WebhookEvent;
      if (this.publicKey) {
        event = this.verifySignature(token);
      } else {
        // In development/testing, parse body directly
        event = request.body as WebhookEvent;
      }

      // Dispatch to handlers
      const eventType = event.eventType as WebhookEventType;
      const handlers = this.handlers.get(eventType) || [];

      // Execute all handlers for this event type
      await Promise.all(handlers.map(handler => handler(event)));

      // Return 200 immediately (process asynchronously)
      reply.code(200).send({ received: true, eventId: event.eventId });
    } catch (error: any) {
      request.log.error({ error }, 'Webhook processing failed');
      reply.code(400).send({ error: error.message });
    }
  }

  /**
   * Register webhook endpoint
   */
  registerEndpoint(app: any, path: string = '/webhooks/hifi'): void {
    app.post(path, async (request: FastifyRequest, reply: FastifyReply) => {
      await this.processWebhook(request, reply);
    });
  }
}

/**
 * Example webhook handlers
 */

export const exampleHandlers = {
  onUserCreate: async (event: WebhookEvent) => {
    console.log('New user created:', event.data.id);
    // Store user in database, send notification, etc.
  },

  onTransferUpdate: async (event: WebhookEvent) => {
    console.log('Transfer updated:', event.data);
    // Update transaction status in database, notify agent, etc.
  },

  onKYCStatusUpdate: async (event: WebhookEvent) => {
    console.log('KYC status changed:', event.data);
    // Notify agent of verification status, enable/disable features, etc.
  },

  onOnrampUpdate: async (event: WebhookEvent) => {
    console.log('Onramp updated:', event.data);
    // Track deposit progress, update balances, etc.
  },

  onOfframpUpdate: async (event: WebhookEvent) => {
    console.log('Offramp updated:', event.data);
    // Track withdrawal progress, update balances, etc.
  },
};

export default WebhookManager;
