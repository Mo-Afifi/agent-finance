/**
 * API Route Definitions
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AgentFinanceSDK } from '../sdk/agent-finance';
import { requireAuth, optionalAuth } from '../auth/middleware';
import { userStorage } from '../auth/storage-factory';

// ==================== Request Schemas ====================

const RegisterAgentSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  type: z.enum(['openclaw', 'custom', 'individual', 'business']).default('openclaw'),
  metadata: z.record(z.any()).optional(),
});

const SendPaymentSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
  memo: z.string().optional(),
});

const CreateDepositAccountSchema = z.object({
  agentId: z.string().min(1),
  fiatCurrency: z.string().optional(),
  cryptoCurrency: z.string().optional(),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
});

const RegisterBankAccountSchema = z.object({
  agentId: z.string().min(1),
  accountType: z.enum(['checking', 'savings']),
  accountNumber: z.string().min(1),
  routingNumber: z.string().min(1),
  bankName: z.string().min(1),
  accountHolderName: z.string().min(1),
});

const DepositFiatSchema = z.object({
  agentId: z.string().min(1),
  amount: z.number().positive(),
  fiatCurrency: z.string().optional(),
  cryptoCurrency: z.string().optional(),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
});

const WithdrawToFiatSchema = z.object({
  agentId: z.string().min(1),
  amount: z.number().positive(),
  bankAccountId: z.string().min(1),
  cryptoCurrency: z.string().optional(),
  fiatCurrency: z.string().optional(),
  chain: z.enum(['ETHEREUM', 'POLYGON', 'BASE']).optional(),
});

// ==================== Route Handlers ====================

/**
 * Helper: Check if user owns agent
 */
async function checkAgentOwnership(
  request: FastifyRequest,
  reply: FastifyReply,
  agentId: string
): Promise<boolean> {
  if (!request.user) {
    reply.code(401).send({
      success: false,
      error: 'Not authenticated',
    });
    return false;
  }

  const ownsAgent = await userStorage.userOwnsAgent(request.user.userId, agentId);
  if (!ownsAgent) {
    reply.code(403).send({
      success: false,
      error: 'Forbidden',
      message: 'You do not own this agent',
    });
    return false;
  }

  return true;
}

export async function registerRoutes(app: FastifyInstance, sdk: AgentFinanceSDK) {
  
  // Health check
  app.get('/health', async (request, reply) => {
    const isHealthy = await sdk.ping();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'agent-finance-api',
    };
  });

  // ==================== Quick Endpoints for Dashboard ====================

  /**
   * GET /activity
   * Get recent activity (stub for now)
   */
  app.get('/activity', { preHandler: optionalAuth }, async (request, reply) => {
    // Stub: Return empty array for now
    // TODO: Implement activity tracking system
    return reply.send([]);
  });

  /**
   * GET /agents
   * List all agents for the authenticated user
   * Requires API key authentication
   */
  app.get(
    '/agents',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const userAgents = await userStorage.getAgentsByUserId(request.user.userId);
        
        // Transform to match frontend Agent interface
        const agents = await Promise.all(
          userAgents.map(async (ua: any) => {
            try {
              // Try to get full agent details from SDK
              const agentDetails = await sdk.getAgent(ua.agentId);
              
              // Transform wallets to frontend format
              const wallets = agentDetails.wallets 
                ? Object.entries(agentDetails.wallets).map(([chain, address]) => ({
                    chain,
                    address: address as string,
                    balance: 0, // TODO: Fetch real balance from blockchain
                  })) 
                : [];
              
              return {
                id: ua.agentId,
                name: ua.name,
                type: 'openclaw' as const,
                hifiUserId: agentDetails.hifiUserId || '',
                wallets, // Use the transformed wallets
                accounts: [],
                verified: agentDetails.verified || false,
                createdAt: ua.createdAt,
                metadata: {},
              };
            } catch {
              // If SDK fails, return minimal data
              return {
                id: ua.agentId,
                name: ua.name,
                type: 'openclaw' as const,
                hifiUserId: '',
                wallets: [],
                accounts: [],
                verified: false,
                createdAt: ua.createdAt,
                metadata: {},
              };
            }
          })
        );

        return reply.send(agents);
      } catch (error: any) {
        request.log.error(error, 'Failed to list agents');
        return reply.code(500).send({
          success: false,
          error: 'Failed to list agents',
          message: error.message,
        });
      }
    }
  );

  /**
   * POST /agents
   * Alias for /api/agents/register (dashboard compatibility)
   * Requires API key authentication
   */
  app.post(
    '/agents',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const body = RegisterAgentSchema.parse(request.body);
        
        // Register agent with HIFI
        const agent = await sdk.registerAgent(body);
        
        // Store agent-user relationship
        await userStorage.registerAgent(body.agentId, request.user.userId, body.name);
        
        // Return format matching frontend Agent interface
        return reply.code(201).send({
          id: body.agentId,
          name: body.name,
          type: 'openclaw' as const,
          hifiUserId: agent.hifiUserId || '',
          wallets: [],
          accounts: [],
          verified: agent.verified || false,
          createdAt: new Date().toISOString(),
          metadata: {},
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to register agent');
        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * DELETE /agents/:id
   * Delete an agent
   * Requires API key authentication and ownership
   */
  app.delete(
    '/agents/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const { id } = request.params as { id: string };
        
        // Check ownership
        if (!(await checkAgentOwnership(request, reply, id))) return;

        // Delete agent-user relationship from storage
        await userStorage.deleteAgent(id, request.user.userId);
        
        return reply.code(200).send({
          success: true,
          message: 'Agent deleted successfully',
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to delete agent');
        return reply.code(500).send({
          success: false,
          error: 'Failed to delete agent',
          message: error.message,
        });
      }
    }
  );

  /**
   * GET /transactions
   * List transactions (stub for now)
   */
  app.get('/transactions', { preHandler: optionalAuth }, async (request, reply) => {
    // Stub: Return empty array for now
    // TODO: Implement transaction history storage
    return reply.send([]);
  });

  /**
   * POST /transactions
   * Create a transaction (stub for now)
   */
  app.post('/transactions', { preHandler: optionalAuth }, async (request, reply) => {
    // Stub: Return mock transaction
    // TODO: Integrate with actual payment SDK
    const body = request.body as any;
    return reply.code(201).send({
      id: `tx_${Date.now()}`,
      fromAgent: body.fromAgent || '',
      toAgent: body.toAgent || '',
      amount: body.amount || 0,
      currency: body.currency || 'USD',
      status: 'pending' as const,
      memo: body.memo,
      createdAt: new Date().toISOString(),
    });
  });

  /**
   * GET /agents/:id/balances
   * Get balances for an agent
   */
  app.get('/agents/:id/balances', { preHandler: optionalAuth }, async (request, reply) => {
    // Stub: Return empty array for now
    // TODO: Fetch real balances from HIFI SDK
    const { id } = request.params as { id: string };
    return reply.send([]);
  });

  /**
   * POST /agents/:id/wallets
   * Create a wallet for an agent
   */
  app.post('/agents/:id/wallets', { preHandler: optionalAuth }, async (request, reply) => {
    // Stub: Return mock wallet
    // TODO: Integrate with HIFI wallet creation
    const { id } = request.params as { id: string };
    const body = request.body as any;
    return reply.code(201).send({
      id: `wallet_${Date.now()}`,
      agentId: id,
      address: `0x${Math.random().toString(16).substring(2, 42)}`,
      chain: body.chain || 'ethereum',
      balance: [],
      hifiWalletId: '',
    });
  });

  /**
   * POST /agents/:id/accounts
   * Create a virtual account for an agent
   */
  app.post('/agents/:id/accounts', { preHandler: optionalAuth }, async (request, reply) => {
    // Stub: Return mock virtual account
    // TODO: Integrate with HIFI virtual account creation
    const { id } = request.params as { id: string };
    const body = request.body as any;
    return reply.code(201).send({
      id: `vacct_${Date.now()}`,
      agentId: id,
      currency: body.currency || 'USD',
      balance: 0,
      accountNumber: '1234567890',
      routingNumber: '021000021',
    });
  });

  // ==================== Agent Identity ====================

  /**
   * POST /api/agents/register
   * Register a new agent in the financial system
   * Requires API key authentication
   */
  app.post(
    '/api/agents/register',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const body = RegisterAgentSchema.parse(request.body);
        
        // Register agent with HIFI
        const agent = await sdk.registerAgent(body);
        
        // Store agent-user relationship
        await userStorage.registerAgent(body.agentId, request.user.userId, body.name);
        
        return reply.code(201).send({
          success: true,
          data: agent,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to register agent');
        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * POST /v1/agents/register
   * Alias for /api/agents/register (landing page compatibility)
   */
  app.post(
    '/v1/agents/register',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        if (!request.user) {
          return reply.code(401).send({
            success: false,
            error: 'Not authenticated',
          });
        }

        const body = RegisterAgentSchema.parse(request.body);
        
        // Register agent with HIFI
        const agent = await sdk.registerAgent(body);
        
        // Store agent-user relationship
        await userStorage.registerAgent(body.agentId, request.user.userId, body.name);
        
        return reply.code(201).send({
          success: true,
          data: agent,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to register agent');
        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * GET /api/agents/:agentId
   * Get agent account information
   * Requires API key authentication and ownership
   */
  app.get(
    '/api/agents/:agentId',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { agentId } = request.params as { agentId: string };
        
        // Check ownership
        if (!(await checkAgentOwnership(request, reply, agentId))) return;

        const agent = await sdk.getAgent(agentId);
        
        return reply.send({
          success: true,
          data: agent,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to get agent');
        return reply.code(404).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * POST /api/agents/:agentId/verify
   * Initiate KYC verification
   * Requires API key authentication and ownership
   */
  app.post(
    '/api/agents/:agentId/verify',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { agentId } = request.params as { agentId: string };
        
        // Check ownership
        if (!(await checkAgentOwnership(request, reply, agentId))) return;

        const { redirectUrl } = request.body as { redirectUrl?: string };
        const kycUrl = await sdk.verifyAgent(agentId, redirectUrl);
        
        return reply.send({
          success: true,
          data: { kycUrl },
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to initiate verification');
        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * GET /api/agents/:agentId/verification-status
   * Check verification status
   * Requires API key authentication and ownership
   */
  app.get(
    '/api/agents/:agentId/verification-status',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { agentId } = request.params as { agentId: string };
        
        // Check ownership
        if (!(await checkAgentOwnership(request, reply, agentId))) return;

        const status = await sdk.getVerificationStatus(agentId);
        
        return reply.send({
          success: true,
          data: status,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to get verification status');
        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // ==================== Wallets & Accounts ====================

  /**
   * GET /api/agents/:agentId/wallets
   * Get agent's wallet addresses
   * Requires API key authentication and ownership
   */
  app.get(
    '/api/agents/:agentId/wallets',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { agentId } = request.params as { agentId: string };
        
        // Check ownership
        if (!(await checkAgentOwnership(request, reply, agentId))) return;

        const wallets = await sdk.getWallets(agentId);
        
        return reply.send({
          success: true,
          data: wallets,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to get wallets');
        return reply.code(404).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * POST /api/accounts/deposit
   * Create virtual account for fiat deposits
   */
  app.post('/api/accounts/deposit', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = CreateDepositAccountSchema.parse(request.body);
      const { agentId, ...options } = body;
      
      const account = await sdk.createDepositAccount(agentId, options);
      
      return reply.code(201).send({
        success: true,
        data: account,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/accounts/bank
   * Register bank account for withdrawals
   */
  app.post('/api/accounts/bank', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = RegisterBankAccountSchema.parse(request.body);
      const { agentId, ...accountDetails } = body;
      
      const account = await sdk.registerBankAccount(agentId, accountDetails);
      
      return reply.code(201).send({
        success: true,
        data: account,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Payments ====================

  /**
   * POST /api/payments/send
   * Send payment from one agent to another
   * Requires API key authentication and ownership of sender agent
   */
  app.post(
    '/api/payments/send',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = SendPaymentSchema.parse(request.body);
        
        // Check ownership of sender agent
        if (!(await checkAgentOwnership(request, reply, body.from))) return;

        const payment = await sdk.sendPayment(body);
        
        return reply.code(201).send({
          success: true,
          data: payment,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to send payment');
        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * GET /api/payments/:paymentId
   * Get payment status
   */
  app.get('/api/payments/:paymentId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { paymentId } = request.params as { paymentId: string };
      const payment = await sdk.getPaymentStatus(paymentId);
      
      return reply.send({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/agents/:agentId/payments
   * List payments for an agent
   * Requires API key authentication and ownership
   */
  app.get(
    '/api/agents/:agentId/payments',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { agentId } = request.params as { agentId: string };
        
        // Check ownership
        if (!(await checkAgentOwnership(request, reply, agentId))) return;

        const { limit } = request.query as { limit?: string };
        const payments = await sdk.listPayments(agentId, limit ? parseInt(limit) : 20);
        
        return reply.send({
          success: true,
          data: payments,
        });
      } catch (error: any) {
        request.log.error(error, 'Failed to list payments');
        return reply.code(400).send({
          success: false,
          error: error.message,
        });
      }
    }
  );

  // ==================== Fiat/Crypto Conversion ====================

  /**
   * POST /api/deposit/fiat
   * Deposit fiat and receive crypto (onramp)
   */
  app.post('/api/deposit/fiat', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = DepositFiatSchema.parse(request.body);
      const { agentId, amount, ...options } = body;
      
      const onramp = await sdk.depositFiat(agentId, amount, options);
      
      return reply.code(201).send({
        success: true,
        data: onramp,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/withdraw/fiat
   * Withdraw crypto to fiat (offramp)
   */
  app.post('/api/withdraw/fiat', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = WithdrawToFiatSchema.parse(request.body);
      const { agentId, amount, bankAccountId, ...options } = body;
      
      const offramp = await sdk.withdrawToFiat(agentId, amount, bankAccountId, options);
      
      return reply.code(201).send({
        success: true,
        data: offramp,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }
  });
}
